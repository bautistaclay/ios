let obj = {
  "status": 0,
  "msg": "",
  "data": {
    "purchasedVIPExpiresAt": "2099-09-09",//
    "vipexpiresAt": "2099-09-09",//
    "temporarySustainDay": "",
    "appAccountToken": "8bcc6ac0-daee-4371-a11a-2c82cf8e92d8",
    "inviteNum": 99,//邀请人数
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOlsiX2VlZDY2YTQwMDI5MjlmZDRjMzg1MTJhOGFhODE3YTRkIiwiY2M1M2ZmM2QwNTQyNGQwMDkwMjE4MGNiNTc5YzhhNDEiXSwiZXhwIjoxNzA5MjA0NzEzfQ.944XUkEC0yOmmI97Rjas7x44wwd_2PBvULaEG9reC2I",
    "purchasedVIP": "2099-09-09",
    "inviteCode": "",
    "vipStatus": 2//
  }
}


$done({ body: JSON.stringify(obj), status: 200 });