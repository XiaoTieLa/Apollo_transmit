一、需求分析
本项目旨在开发一个基于Foxglove Studio的跨平台机器人控制面板扩展，与Apollo机器人算法程序工程进行交互。
核心需求：
1. 三通道控制：通过Foxglove WebSocket Protocol v1协议实现对机器人系统的启动、数据采集等控制
2. 实时状态监控：可视化展示连接状态和操作记录
3. 协议兼容性：遵守Foxglove WebSocket协议规范，与服务端协议要求一致
4. 配置可维护性：模块化管理topic、command和address配置
5. 可接收性：可接收服务端传回的回调请求
6. 异常处理：完善的错误提示和自动恢复机制
7. 跨平台：通过Foxglove Extension SDK可以打包成.foxe文件，在各个平台上都适用
二、技术实现
1. 关键技术栈：
  - 框架：typescript + Foxglove Extension SDK + React 
  - 通信协议：Foxglove WebSocket Protocol v1
  - 核心库：@foxglove/ws-protocol，@foxglove/extension，react-dom
  - 样式方案：CSS-in-JS
2. 关键实现：
  - 频道管理：使用FoxgloveClient动态的进行注册/注销/控制频道，通过订阅对应的频道ID可以接收服务端发送的请求
  - 消息处理：文本编码消息的发送与接收，通过encode转为字节流，服务端可以读取信息的地址和长度来进行解析，也可使用protobuf形式或json形式进行传输
  - 状态同步：双向状态追踪（连接态/操作态）
  - Foxglove panel生命周期管理：使用useEffect和useLayoutEffect，在context变化时对panel进行刷新，并在删除panel时调用Unmount函数结束进程
  - 配置模块化：独立配置文件解耦业务逻辑
    - 在src/config/目录下的三个config文件
      - address_config：配置服务端IP地址及端口
      - command_config：配置传输的指令
      - topic_config：配置channel的topic便于服务端进行解析
三、使用说明
1. 可以直接使用打包好的.foxe文件在Foxglove Studio中安装本地扩展
2. 本地自行编译
  1. 在主目录下使用npm install --force命令安装相应拓展包 ，npm install @foxglove/ws-protocol --force，npm install ws命令安装通信协议库，
  2. 修改src/config目录下的三个config文件对应你的需求
  3. npm run local-install进行安装
四、附录
ws-protocol仓库：https://github.com/foxglove/ws-protocol/tree/main
create-foxglove-extension：https://github.com/foxglove/create-foxglove-extension/tree/main
开发者docs及API接口参考：https://docs.foxglove.dev/docs
Foxglove下载：https://foxglove.dev/download