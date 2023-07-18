import { theme } from 'antd';

export const themes = {
    default: 'light',
    supports: window.matchMedia('(prefers-color-scheme)').matches ? ['system', 'light', 'dark'] : ['light', 'dark'],
    themes: [{
        name: 'light',
        algorithm: theme.defaultAlgorithm,
        logo: 'rgba(25, 57, 55, 1)',
        header: 'rgba(231, 250, 245, 1)',
        content: 'rgba(255, 255, 255, 1)',
        footer: 'rgba(235, 235, 235, 1)',
    }, {
        name: 'dark',
        algorithm: theme.darkAlgorithm,
        logo: 'rgba(231, 250, 245, 1)',
        header: 'rgba(25, 57, 55, 1)',
        content: 'rgba(20, 20, 20, 1)',
        footer: 'rgba(30, 30, 30, 1)'
    }],
    getTheme: (text: string | null) => {
        if (text === 'system' && window.matchMedia('(prefers-color-scheme)').matches) {
            const name = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const theme = Object.assign({}, themes.themes.find(x => x.name === name) ?? themes.themes.find(x => x.name === themes.default)!);
            theme.name = 'system';
            return theme;
        } else {
            const name = text ?? themes.default;
            const theme = themes.themes.find(x => x.name === name) ?? themes.themes.find(x => x.name === themes.default)!;
            return theme;
        }
    },
    // https://ant.design/docs/react/migrate-less-variables-cn
    antd: {
        colorPrimary: '#39cebf',
    }
}