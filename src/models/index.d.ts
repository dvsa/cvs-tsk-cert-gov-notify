interface IInvokeConfig {
    params: { apiVersion: string; endpoint?: string; };
    functions: { testResults: { name: string }, techRecords: { name: string; mock: string } };
}

interface INotifyConfig {
    api_key: string;
}

interface IS3Config {
    endpoint: string;
}

export {IInvokeConfig, INotifyConfig, IS3Config};
