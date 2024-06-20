// i18n.js
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from './en.js';
import zh from './zh.js';


Vue.use(VueI18n)

const i18n = new VueI18n({
    locale: 'en', // 默认语言
    fallbackLocale: 'zh', // 当找不到匹配的语言时回退到的语言
    messages: {
      en,// 导入语言文件
      zh
    },
})

export default i18n
