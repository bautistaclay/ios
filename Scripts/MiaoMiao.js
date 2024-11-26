let obj = JSON.parse($response.body);
obj.data = {
  "purchasedVIPExpiresAt": "2099-09-09",//
  "vipexpiresAt": "2099-09-09",//
  "temporarySustainDay": "",
  "appAccountToken": "",
  "inviteNum": 99,
  "token": "",
  "purchasedVIP": "2099-09-09",
  "inviteCode": "",
  "vipStatus": 1//
};

$done({ body: JSON.stringify(obj) });