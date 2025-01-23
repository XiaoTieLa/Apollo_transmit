"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchAssetStatus = exports.ServerCapability = exports.StatusLevel = exports.ClientBinaryOpcode = exports.BinaryOpcode = void 0;
var BinaryOpcode;
(function (BinaryOpcode) {
    BinaryOpcode[BinaryOpcode["MESSAGE_DATA"] = 1] = "MESSAGE_DATA";
    BinaryOpcode[BinaryOpcode["TIME"] = 2] = "TIME";
    BinaryOpcode[BinaryOpcode["SERVICE_CALL_RESPONSE"] = 3] = "SERVICE_CALL_RESPONSE";
    BinaryOpcode[BinaryOpcode["FETCH_ASSET_RESPONSE"] = 4] = "FETCH_ASSET_RESPONSE";
})(BinaryOpcode || (exports.BinaryOpcode = BinaryOpcode = {}));
var ClientBinaryOpcode;
(function (ClientBinaryOpcode) {
    ClientBinaryOpcode[ClientBinaryOpcode["MESSAGE_DATA"] = 1] = "MESSAGE_DATA";
    ClientBinaryOpcode[ClientBinaryOpcode["SERVICE_CALL_REQUEST"] = 2] = "SERVICE_CALL_REQUEST";
})(ClientBinaryOpcode || (exports.ClientBinaryOpcode = ClientBinaryOpcode = {}));
var StatusLevel;
(function (StatusLevel) {
    StatusLevel[StatusLevel["INFO"] = 0] = "INFO";
    StatusLevel[StatusLevel["WARNING"] = 1] = "WARNING";
    StatusLevel[StatusLevel["ERROR"] = 2] = "ERROR";
})(StatusLevel || (exports.StatusLevel = StatusLevel = {}));
var ServerCapability;
(function (ServerCapability) {
    ServerCapability["clientPublish"] = "clientPublish";
    ServerCapability["time"] = "time";
    ServerCapability["parameters"] = "parameters";
    ServerCapability["parametersSubscribe"] = "parametersSubscribe";
    ServerCapability["services"] = "services";
    ServerCapability["connectionGraph"] = "connectionGraph";
    ServerCapability["assets"] = "assets";
})(ServerCapability || (exports.ServerCapability = ServerCapability = {}));
var FetchAssetStatus;
(function (FetchAssetStatus) {
    FetchAssetStatus[FetchAssetStatus["SUCCESS"] = 0] = "SUCCESS";
    FetchAssetStatus[FetchAssetStatus["ERROR"] = 1] = "ERROR";
})(FetchAssetStatus || (exports.FetchAssetStatus = FetchAssetStatus = {}));
//# sourceMappingURL=types.js.map