$httpClient.get('http://whois.pconline.com.cn/ipJson.jsp?json=true', function(error, response, data) {
    // 处理GBK编码，转换为UTF-8
    let jsonStr = data;
    try {
        let jsonData = JSON.parse(jsonStr);
        let ip = jsonData.ip;
        let addr = jsonData.addr;
        let pro = jsonData.pro;
        let city = jsonData.city;
        
        $done({
            title: 'Domestic IP',
            content: `${addr}\n${ip}`,
            icon: 'network'
        });
    } catch (e) {
        $done({
            title: '查询错误',
            content: '请稍后重试'
        });
    }
});