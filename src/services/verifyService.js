import ApiService from '../utils/apiService';
class VerifyService {
    constructor() {
        this.apiService = new ApiService();
    }
    
    //查询产品信息列表
    verifyData(data) {
        return this.apiService.post(`/awards/redeem?securityCode=${data.barcode}`,{}, true)
    }

}

export default VerifyService;
