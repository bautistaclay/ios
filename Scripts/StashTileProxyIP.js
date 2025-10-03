$httpClient.get('http://ip-api.com/json?lang=zh-CN', function (error, response, data){
	let jsonData = JSON.parse(data)
	let country =jsonData.country 
	let query =jsonData.query
	;
$done({
    title: 'Foreign IP',
    content: `${country}\n${query}`,
  })
 })