import { Storage } from "@plasmohq/storage";

export const tabs = {
    options:{
        api:'',
        user:'',
        token:''
    },
    storage: new Storage(),
    rules: {
        string: {
            isNullOrEmpty: (text: any): boolean => {
                if (typeof text !== 'string'){return true;}
                if (text.length === 0) { return true; }
                return false;
            },
        },
        options: {
            isBad: (options?: {
                api?: string,
                user?: string,
                token?: string
            }): boolean => {
                return [options?.api, options?.user, options?.token].reduce((pipeline, current) => {
                    return pipeline || tabs.rules.string.isNullOrEmpty(current);
                }, false);
            }
        },
        url:{
            isBad :(url?:string):boolean=>{
                return tabs.rules.string.isNullOrEmpty(url) || ['edge://', 'chrome://','about:'].reduce((pipeline,current)=>{
                    return pipeline || url.startsWith(current);
                },false);
            }
        }
    },
    colors:{
        background:'#39cebf',
        text:'#ffffff'
    },
    watch: {
        options: ({ newValue, oldValue }) => {
            console.log('options.watch', newValue, oldValue);
            tabs.options = newValue;
        }
    },
    actions:{
        openOptions: () => {
            console.log('actions.openOptions');
            chrome.tabs.create({
                url: "options.html"
            });
        },
        init: () => {
            tabs.storage.get('options').then((value:any) => {
                console.log('options.get', value);
                if (tabs.rules.options.isBad(value)) {
                    tabs.actions.openOptions();
                }else{
                    tabs.options = value;
                }
                
                console.log('options.watch', tabs.watch, tabs.storage.watch(tabs.watch));

                chrome.action.setBadgeBackgroundColor({
                    color: tabs.colors.background
                }).then(()=>{
                    console.log('badge.background', tabs.colors.background);
                });

                chrome.action.setBadgeTextColor({
                    color: tabs.colors.text
                }).then(()=>{
                    console.log('badge.text', tabs.colors.text);
                }),

                chrome.runtime.onInstalled.addListener(({ reason }) => {
                    console.log('install', reason);
                    if (typeof tabs.events[reason] === 'function') {
                        tabs.events[reason]();
                    }
                });

                chrome.action.onClicked.addListener((tab) => {
                    console.log('click', tab);
                    tabs.actions.run([tab]);
                });

                chrome.commands.onCommand.addListener((command) => {
                    console.log('command', command);
                    if (typeof tabs.events[command] === 'function') {
                        tabs.events[command]();
                    }
                });
            });
        },
        run: (tasks: Array<chrome.tabs.Tab>) => {
            console.log('run.options', tabs.options);
            if (tabs.rules.options.isBad(tabs.options)) {
                tabs.actions.openOptions();
                return;
            }
            console.log('run.tasks', tasks);
            tasks.reduce((pipeline, current) => {
                return pipeline.then((remain) => {
                    console.log('run.remain', remain);
                    return new Promise((resolve) => {
                        console.log('run.current', current);
                        chrome.action.setBadgeText({ text: `${remain}` })
                            .then(() => {
                                if (tabs.rules.url.isBad(current?.url)) {
                                    console.log('run.skip');
                                    resolve(remain - 1);
                                    return;
                                }
                                const query = [`url=${encodeURIComponent(current.url)}`];
                                if (!tabs.rules.string.isNullOrEmpty(current?.title)) {
                                    query.push(`title=${encodeURIComponent(current.title)}`);
                                }
                                fetch(`${tabs.options.api}?${query.join('&')}`, {
                                    headers: {
                                        User: tabs.options.user,
                                        Token: tabs.options.token
                                    }
                                }).then((response) => {
                                    console.log('run.response', response);
                                    if (response.status === 201) {
                                        if (current.id === null) { return; }
                                        console.log('run.remove', current.id);
                                        chrome.tabs.remove(current.id);
                                    }
                                }).finally(() => {
                                    resolve(remain - 1);
                                });

                            });
                    });
                });
            }, Promise.resolve(tasks.length)).then((remain) => {
                console.log('run.done', remain);
                chrome.action.setBadgeText({ text: '' });
            });
        }
    },
    events : {
        tab:()=>{
            console.log('events.tab');
            chrome.tabs.query({
                currentWindow: true,
                active: true
            }).then(([task])=>{
                console.log('tab.query', task);
                tabs.actions.run([task]);
            });
        },
        tabs:()=>{
            console.log('events.tabs');
            chrome.tabs.query({
                currentWindow: true
            }).then((tasks) => {
                console.log('tabs.query', tasks);
                tabs.actions.run(tasks);
            });
        },
        install:()=>{
            console.log('events.install');
        },
        update:()=>{
            console.log('events.update');
        }
    },
};

tabs.actions.init();