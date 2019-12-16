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

interface ISecretConfig {
  notify: {
    api_key: string
  };
}

interface IIndexS3Config {
  [key: string]: IS3Config;
}

interface IIndexInvokeConfig {
  [key: string]: IInvokeConfig;
}

interface IConfig {
  s3: IIndexS3Config;
  notify: INotifyConfig;
  invoke: IIndexInvokeConfig;
}


export { IInvokeConfig, INotifyConfig, IS3Config, ISecretConfig, IConfig };
