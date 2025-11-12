// 使用cip.cc接口 - 国内服务
$httpClient.get('http://cip.cc', function(error, response, data) {
    if (error) {
        $done({
            title: 'IP查询失败',
            content: error
        });
        return;
    }
    
    try {
        let lines = data.split('\n');
        let ip = '', location = '', isp = '';
        
        for (let line of lines) {
            if (line.includes('IP')) ip = line.split(':')[1]?.trim();
            if (line.includes('地址')) location = line.split(':')[1]?.trim();
            if (line.includes('运营商')) isp = line.split(':')[1]?.trim();
        }
        
        $done({
            title: 'Domestic IP',
            content: `IP ： ${ip}\n位置： ${location}\n运营商：${isp}`
        });
    } catch (e) {
        $done({
            title: '解析失败',
            content: e.message
        });
    }
});