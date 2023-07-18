import { useCallback, useEffect, useRef, useState } from 'react';
import type { PlasmoRender } from "plasmo"
import { Storage } from "@plasmohq/storage";
import { IntlProvider, useIntl,FormattedMessage } from "react-intl";
import { ConfigProvider, App, Layout, Space, Form, Input, Select, Button, Spin, Typography, Tag } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { locales } from './locales';
import { themes } from './themes';
import Logo from "react:~assets/icon.svg";

import './options.less';

const storage = new Storage();



const Options: React.FC<{ locale:any, theme:any, onThemeChange: (value: any) => void, onLocaleChange: (value: any) => void }> = ({ locale,theme, onThemeChange, onLocaleChange })=>{
    console.log('options', locale, theme);
    const [form] = Form.useForm();
    const { message } = App.useApp();
    const i18n = useIntl();

    const tags = [
        { text: 'tabs', color: '#39cebf', url: 'https://github.com/sduo/tabs' },
        { text: 'antd', color: '#1677FF', url: 'https://ant.design/' },
        { text: 'plasmo', color: '#000000', url: 'https://github.com/PlasmoHQ/plasmo' },
        { text: 'pnpm', color: '#F69220', url: 'https://pnpm.io/' },
    ];

    useEffect(()=>{
        storage.get('options').then((value:any) => {
            form.setFieldsValue(value);
        });
    },[]);

    const onConfirmClick = (options)=>{
        storage.set('options', options).then(() => {
            message.success(i18n.formatMessage({ id: 'message.action.success' }, { action: i18n.formatMessage({ id: 'action.save' }) }));
        });
    };

    const onResetClick = ()=>{
        form.resetFields();
    };

    const onInitializeClick = ()=>{
        storage.set('options', {}).then(() => {
            form.setFieldsValue({});
            message.success(i18n.formatMessage({ id: 'message.action.success' }, { action: i18n.formatMessage({ id: 'action.initialize' }) }));
        });
    };

    const onLocaleSelect = (value:string) => {
        console.log('onLocaleSelect', value);
        storage.set('locale', value).then(()=>{
            onLocaleChange(locales.getLocale(value));
        });
    };

    const onThemeSelect = (value:string) => {
        console.log('onThemeSelect',value);
        storage.set('theme', value).then(() => {
            onThemeChange(themes.getTheme(value));
        });
    };

    // 友情链接
    const onLinkTagRender = (row: {url?:string,color:string,text:string}, index: number) => {
        return (<Typography.Link key={index} href={row.url ?? 'javascript:;'} target='_blank'><Tag color={row.color}>{row.text}</Tag></Typography.Link>);
    };

    return (
        <Layout className={'layout'}>
            <Layout.Header className={'header'} style={{ backgroundColor:theme.header}}>
                <Space className={'logo'} style={{ color: theme.logo }}>
                    <Logo />
                    {/* <Typography.Text>Tabs</Typography.Text> */}
                </Space>
                <Space>
                    <Select defaultValue={locale.name} options={locales.supports.map((x) => { return { label: i18n.formatMessage({ id: `lang.${x.name}` }), value: x.name }; })} onSelect={onLocaleSelect} />
                    <Select defaultValue={theme.name} options={themes.supports.map((x) => { return { label: i18n.formatMessage({ id: `theme.${x}` }), value: x }; })} onSelect={onThemeSelect} />
                    <Button type="primary" ghost onClick={onInitializeClick}>{i18n.formatMessage({ id: 'action.initialize' })}</Button>
                </Space>
            </Layout.Header>
            <Layout.Content className={'content'} style={{ backgroundColor: theme.content }}>
                <Space direction="vertical" className={'options'}>
                    <Form form={form} onFinish={onConfirmClick} >
                        <Form.Item label={i18n.formatMessage({ id: 'api' })} name="api" rules={[{ required: true, message: i18n.formatMessage({ id: 'error.required' }) }]}>
                            {<Input placeholder={i18n.formatMessage({ id: 'placeholder.input' }, { name: i18n.formatMessage({ id: 'api' }) })} /> }
                        </Form.Item>
                        <Form.Item label={i18n.formatMessage({ id: 'user' })} name="user" rules={[{ required: true, message: i18n.formatMessage({ id: 'error.required' }) }]}>
                            <Input placeholder={i18n.formatMessage({ id: 'placeholder.input' }, { name: i18n.formatMessage({ id: 'user' }) })} />
                        </Form.Item>
                        <Form.Item label={i18n.formatMessage({ id: 'token' })} name="token" rules={[{ required: true, message: i18n.formatMessage({ id: 'error.required' }) }]}>
                            {<Input placeholder={i18n.formatMessage({ id: 'placeholder.input' }, { name: i18n.formatMessage({ id: 'token' }) })} /> }
                        </Form.Item>
                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit">{i18n.formatMessage({ id: 'action.confirm' })}</Button>
                                <Button onClick={onResetClick}>{i18n.formatMessage({ id: 'action.reset' })}</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Space>
            </Layout.Content>
            <Layout.Footer className={'footer'} style={{ backgroundColor: theme.footer }}>
                <Space direction="vertical">
                    <Space>{tags.map(onLinkTagRender)}</Space>
                </Space>
            </Layout.Footer>
        </Layout>
    );
};

const Provider: React.FC<{ state: any }> = ({state}) => {
    console.log('provider', state);
    const [locale, setLocale] = useState(state.locale);
    const [theme, setTheme] = useState(state.theme);
    return (
        <IntlProvider locale={locale.name} messages={locale.i18n}>
            <ConfigProvider locale={locale.antd} theme={{ token: themes.antd, algorithm: theme.algorithm }}>
                <App>
                    <Options locale={locale} theme={theme} onLocaleChange={setLocale} onThemeChange={setTheme} />
                </App>
            </ConfigProvider>
        </IntlProvider>
    );
};

const Index: React.FC = () => {
    const title = chrome.i18n.getMessage("titleOptions");
    document.title = title;
    console.log('index', title);    
    
    const [loading, setLoading] = useState(true);
    const state = useRef(null);

    Promise.all([storage.get('locale'), storage.get('theme')]).then(([locale,theme]) => {
        state.current = {
            locale:locales.getLocale(locale),
            theme: themes.getTheme(theme)
        };
        setLoading(false);
    });
    return (loading ? <Spin className={'spin'} indicator={<LoadingOutlined style={{ fontSize: 96}} spin />} /> : <Provider state={state.current} /> );
};

export default Index;