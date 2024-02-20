interface IInvokeConfig {
  params: { apiVersion: string; endpoint?: string };
  functions: { testResults: { name: string }; techRecords: { name: string; mock: string } };
}

interface INotifyConfig {
  api_key: string;
  templateId: string;
}

interface IS3Config {
  endpoint: string;
}

interface ISecretConfig {
  notify: {
    api_key: string;
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

interface IPartialParams {
  personalisation: any;
  email: string;
  shouldEmail: string;
  fileData?: AWS.S3.Body;
  documentType: DocumentTypes;
}

enum DocumentTypes {
  CERTIFICATE = "certificate",
  MINISTRY_PLATE = "VTG6_VTG7",
  TRAILER_INTO_SERVICE = "TrailerIntoService",
  TFL_FEED = "TFL_FEED",
  ADR_CERTIFICATE = "ADR_CERTIFICATE",
}

export { DocumentTypes, IConfig, IInvokeConfig, INotifyConfig, IPartialParams, IS3Config, ISecretConfig };
