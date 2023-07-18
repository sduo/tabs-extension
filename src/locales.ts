import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import i18n_zhCN from "./i18n/zh-CN";
import i18n_enUS from "./i18n/en-US";

export const locales = {
    default: 'zh-CN',
    supports: [{
        name: 'zh-CN',
        i18n: i18n_zhCN,
        antd: zhCN
    }, {
        name: 'en-US',
        i18n: i18n_enUS,
        antd: enUS
    }],
    getLocale: (text: string | null) => {
        const name = text ?? locales.default;
        return locales.supports.find(x => x.name === name)!;
    }
};