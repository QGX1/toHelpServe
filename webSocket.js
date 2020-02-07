// websocke服务端的配置
const WebSocket=require('ws');

// 定义webshocket服务器
const wsServer= new WebSocket.Server({port:3030});
// 定义连接到的webSocket集合
let socketSet=[];

// 监听连接
wsServer.on('connection',(websocket,req,res)=>{
    console.log('web',req.url)
    const userId=req.url.split('/');
    console.log(222,userId[2])
    let isExist =false;//标记当前用户是否在线
    socketSet.forEach(ws=>{
        console.log(444,ws)
        if(ws.currentId==userId[1]) isExist=true;
    });
    console.log(333,isExist)

    if(!isExist){
        socketSet.push({
            websocket:websocket,
            currentId:userId[1]
        })
    }

    
    // 监听受到消息后将消息推送给目标对象
    websocket.on('message',function incoming(message){
        console.log("message",message)
        const msgObj=JSON.parse(message);
        socketSet.forEach(ws=>{
            console.log(333,ws)
            if(ws.websocket.readyState==1){
                // 客户端与服务端连接成功
                ws.websocket.send(JSON.stringify({
                    msg:msgObj.msg,
                    from: msgObj.current
                }))
            }
        })
    })

});
