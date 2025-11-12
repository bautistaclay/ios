// 使用ip-api.com接口 - 国际服务
$httpClient.get('http://ip-api.com/json?lang=zh-CN', function(error, response, data) {
    if (error) {
        $done({
            title: 'IP查询失败',
            content: error
        });
        return;
    }
    
    try {
        let jsonData = JSON.parse(data)
	let country =jsonData.country 
	let query =jsonData.query;

        
        $done({
            title: 'Foreign IP',
            content: `IP ： ${query}\n国家： ${country}`
        });
    } catch (e) {
        $done({
            title: '解析失败',
            content: e.message
        });
    }
});