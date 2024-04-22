/* eslint-disable @typescript-eslint/no-unused-vars */
import * as fs from 'fs';
import * as path from 'path';
import sinon from 'sinon';
import { CertificateDownloadService } from '../../src/services/CertificateDownloadService';
import { S3BucketMockService } from '../models/S3BucketMockService';
import { Configuration } from '../../src/utils/Configuration';
import { IGetObjectCommandOutput } from '../../src/models';

describe('CertificateDownloadService', () => {
  const sandbox = sinon.createSandbox();
  process.env.BUCKET = 'local';
  (Configuration as any).instance = new Configuration('../../src/config/config.yml', '../../tests/resources/mockSecrets.yml');
  // @ts-expect-error
  const certificateDownloadService: CertificateDownloadService = new CertificateDownloadService(new S3BucketMockService());

  afterEach(() => {
    sandbox.restore();
  });

  S3BucketMockService.buckets.push({
    bucketName: 'cvs-cert-local',
    files: ['1_1B7GG36N12S678410_1.base64'],
  });
  S3BucketMockService.setMetadata({
    vrm: 'BQ91YHQ',
    'test-type-name': 'Annual test',
    'date-of-issue': '11 March 2019',
    'total-certs': '2',
    'test-type-result': 'prs',
    'cert-type': 'PSV_PRS',
    'cert-index': '1',
    'file-format': 'pdf',
    'file-size': '306784',
    'should-email-certificate': 'true',
    email: 'testemail@testdomain.com',
  });

  context('getCertificate()', () => {
    // it("should return appropriate data", async () => {
    //   const expectedResponse = {
    //     personalisation: {
    //       vrms: "BQ91YHQ",
    //       test_type_name: "Annual test",
    //       date_of_issue: "11 March 2019",
    //       total_certs: "2",
    //       test_type_result: "prs",
    //       cert_type: "PSV_PRS",
    //       cert_index: "1",
    //       file_format: "pdf",
    //       file_size: "306784",
    //     },
    //     email: "testemail@testdomain.com",
    //     fileData: fs.readFileSync(path.resolve(__dirname, `../resources/certificates/base64/1_1B7GG36N12S678410_1.base64`)),
    //     shouldEmail: "true",
    //     documentType: "certificate",
    //   };
    //   expect.assertions(1);
    //   const response = await certificateDownloadService.getCertificate("1_1B7GG36N12S678410_1.base64");
    //   expect(response).toEqual(expectedResponse);
    // });
    it('should bubble up error from S3 Client', async () => {
      // Remove bucket so download fails
      S3BucketMockService.buckets.pop();
      expect.assertions(1);
      try {
        await certificateDownloadService.getCertificate('1_1B7GG36N12S678410_1.base64');
      } catch (e) {
        // @ts-ignore
        expect(e.message).toEqual('The specified bucket does not exist.');
      }
    });
  });

  context('cleanForLogging', () => {
    it('strips out garbage (with $response)', () => {
      const input = {
        Body: 'not empty',
        $response: { thing: 'also not empty' },
        Survives: true,
      };
      const expectedOutput = {
        Body: { redacted: true },
        Survives: true,
      };
      const response = certificateDownloadService.cleanForLogging(input);
      expect(response).toEqual(expectedOutput);
    });

    it('strips out garbage (without $response)', () => {
      const input = {
        Body: 'not empty',
        Survives: true,
      };
      const expectedOutput = {
        Body: { redacted: true },
        Survives: true,
      };
      const response = certificateDownloadService.cleanForLogging(input);
      expect(response).toEqual(expectedOutput);
    });
  });

  context('generatePartialParams()', () => {
    it('should return a partial params for a plate', () => {
      const expectedParams = {
        email: 'test@test.com',
        shouldEmail: 'true',
        fileData: '1234',
        documentType: 'VTG6_VTG7',
        personalisation: {
          vrms: '12345',
          date_of_issue: '12345',
        },
      };

      const result: IGetObjectCommandOutput = {
        Metadata: {
          'document-type': 'VTG6_VTG7',
          vrm: '12345',
          'date-of-issue': '12345',
          email: 'test@test.com',
          'should-email-certificate': 'true',
        },
        Body: '1234' as unknown as Buffer,
        $metadata: {},
      };

      const res = certificateDownloadService.generatePartialParams(result);
      expect(res).toStrictEqual(expectedParams);
    });

    it('should return a partial params for a letter', () => {
      const expectedParams = {
        email: 'test@test.com',
        shouldEmail: 'true',
        fileData: '1234',
        documentType: 'TrailerIntoService',
        personalisation: {
          trailer_id: '12345',
          date_of_issue: '12345',
        },
      };

      const result: IGetObjectCommandOutput = {
        Metadata: {
          'document-type': 'TrailerIntoService',
          'date-of-issue': '12345',
          email: 'test@test.com',
          'should-email-certificate': 'true',
          'trailer-id': '12345',
        },
        Body: '1234' as unknown as Buffer,
        $metadata: {},
      };

      const res = certificateDownloadService.generatePartialParams(result);
      expect(res).toStrictEqual(expectedParams);
    });
  });
});
