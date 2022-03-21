'use strict';
console.log('Loading event');

let aws = require('aws-sdk');
let dynamo = new aws.DynamoDB({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'local',  // needed if you don't have aws credentials at all in env
  secretAccessKey: 'local',
  params: {TableName: 'mailing'}
});

exports.handler = (event, context, callback) => {
  // console.log('Received event:', JSON.stringify(event, null, 2));
  const message = JSON.parse(event.Records[0].Sns.Message);
  // console.log("message:" +  JSON.stringify(message))
  switch(message.notificationType) {
    case "Bounce":
      handleBounce(message, callback);
      break;
    case "Complaint":
      handleComplaint(message, callback);
      break;
    case "Delivery":
      handleDelivery(message, callback);
      break;
    default:
      callback("Unknown notification type: " + message.notificationType);
  }

};

function handleBounce(message, callback) {
  const messageId = message.mail.messageId;
  const addresses = message.bounce.bouncedRecipients.map(function(recipient){
    return recipient.emailAddress;
  });
  console.log(addresses.length);
  const bounceType = message.bounce.bounceType;

  console.log("Message " + messageId + " bounced when sending to " + addresses.join(", ") + ". Bounce type: " + bounceType);

  for (var i=0; i<addresses.length; i++){
    writeDDB(addresses[i], message, "invalid", callback);
  }
}

function handleComplaint(message, callback) {
  const messageId = message.mail.messageId;
  const addresses = message.complaint.complainedRecipients.map(function(recipient){
    return recipient.emailAddress;
  });

  console.log("A complaint was reported by " + addresses.join(", ") + " for message " + messageId + ".");

  for (var i=0; i<addresses.length; i++){
    writeDDB(addresses[i], message, "invalid", callback);
  }
}

function handleDelivery(message, callback) {
  const messageId = message.mail.messageId;
  const deliveryTimestamp = message.delivery.timestamp;
  const addresses = message.delivery.recipients;

  console.log("Message " + messageId + " was delivered successfully at " + deliveryTimestamp + ".");

  for (var i=0; i<addresses.length; i++){
    writeDDB(addresses[i], message, "valid", callback);
  }
}

function writeDDB(email, payload, status, callback) {
  const item = {
    email: {S: email},
    notificationType: {S: payload.notificationType},
    from: {S: payload.mail.source},
    timestamp: {S: payload.mail.timestamp},
    status: {S: status},
    messageId: {S: payload.mail.messageId}
  };

  if (payload.notificationType === 'Bounce') {
    item.bounceType = {S: payload.bounce.bounceType};
    item.bounceSummary = {S: JSON.stringify(payload.bounce.bouncedRecipients)};
  } else if(payload.notificationType === 'Complaint') {
    item.complaintType = {S: payload.complaint.complaintFeedbackType};
  }

  const params = {
    Item: item
  };

  console.log(params);
  callback(null, 'success');
  dynamo.putItem(params,function(err,data){
    if (err) {
      console.log(err);
      callback(err);
    } else console.log(data); {
      callback(null, '');
    }
  });
}