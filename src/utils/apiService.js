import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

class ApiService {
  constructor(baseURL) {
    this.api = axios.create({
      baseURL: baseURL || 'https://ezlot-b-eu-prod-urlssdqqlp.eu-west-1.fcapp.run/', // 你的API基础URL
      timeout: 600000, // 请求超时时间
    });

    // 请求拦截器
    this.api.interceptors.request.use((config) => {
      NProgress.start();
      if (config.requireAuth === false) return config;
      const token = this.getToken();
      if (token) {
        config.headers['Authorization'] = `${token}`;
      }
      return config;
    }, (error) => {
      NProgress.done();
      // 对请求错误做些什么
      return Promise.reject(error);
    });

    // 响应拦截器
    this.api.interceptors.response.use((response) => {
      // 对响应数据做点什么
      NProgress.done();
      return response;
    }, (error) => {
      // 对响应错误做点什么
      NProgress.done();
      return Promise.reject(error);
    });
  }

  // 获取 token 的方法，你可以根据实际情况修改
  getToken() {
    return localStorage.getItem('token');
  }
  // New method for downloading files
  downloadFile(url,fileName, requireAuth = true) {
    return new Promise((resolve, reject) => {

      this.api.get(url, {
        requireAuth
      }).then(response => {
        if (response.status === 200) {
          if(response.data.code == 0){
            reject(response.data.msg);
            return;
          }
          const contentDisposition = response.headers['content-disposition'];
          if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
            if (fileNameMatch) {
              fileName = fileNameMatch[1];
              fileName = decodeURIComponent(fileName);
            }
          }
          const blob = new Blob([response.data], { type: response.headers['content-type'] });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          resolve();
        } else {
          reject("File download failed");
        }
      }).catch(error => {
        reject(error);
      });
    });
  }
  // API 调用方法
  get(url, params, requireAuth = true) {
    return new Promise((resolve, reject) => {
      this.api.get(url, { params, requireAuth }).then(response => {
        console.log(response);
        if (response.status === 200) {
          switch (response.data.code) {
            case 1:
              resolve(response.data);
              break;
            case -1:
              localStorage.removeItem('token');
              break;
            default:
              reject(response.data.msg);
              break;
          }
        } else {
          reject("请求失败");
        }
      }).catch(error => {
        reject(error);
      });
    })
  }

  post(url, data, requireAuth = true) {
    return new Promise((resolve, reject) => {
      this.api.post(url, data, { requireAuth }).then(response => {
        if (response.status === 200) {
          switch (response.data.code) {
            case 1:
              resolve(response.data);
              break;
            case -1:
              localStorage.removeItem('token');
              break;
            default:
              reject(response.data.msg);
              break;
          }
        } else {
          reject("请求失败");
        }
      }).catch(error => {
        reject(error);
      });
    })
  }

  post2(url, data, requireAuth = true) {
    return new Promise((resolve, reject) => {
      this.api.post(url, data, { requireAuth }).then(response => {
        if (response.status === 200) {
          resolve(response.data);
        } else {
          reject("请求失败");
        }
      }).catch(error => {
        reject(error);
      });
    })
  }

  // 其他 HTTP 方法，如 put, delete 等
}

export default ApiService;
