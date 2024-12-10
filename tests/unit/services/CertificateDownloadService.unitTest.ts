/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jest/no-conditional-expect */
import * as fs from 'fs';
import * as path from 'path';
import "reflect-metadata";
import sinon from 'sinon';
import { CertificateDownloadService } from '../../../src/services/CertificateDownloadService';
import { Configuration } from '../../../src/utils/Configuration';
import { S3BucketMockService } from '../../models/S3BucketMockService';

describe('CertificateDownloadService', () => {
  const sandbox = sinon.createSandbox();
  process.env.BUCKET = 'local';
  (Configuration as any).instance = new Configuration('../../src/config/config.yml', '../../../tests/resources/mockSecrets.yml');
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
    it('should return appropriate data', async () => {
      const expectedResponse = {
        Body: fs.readFileSync(path.resolve(__dirname, '../../resources/certificates/base64/1_1B7GG36N12S678410_1.base64')),
        Metadata: {
          "cert-index": "1",
          "cert-type": "PSV_PRS",
          "date-of-issue": "11 March 2019",
          "email": "testemail@testdomain.com",
          "file-format": "pdf",
          "file-size": "306784",
          "should-email-certificate": "true",
          "test-type-name": "Annual test",
          "test-type-result": "prs",
          "total-certs": "2",
          "vrm": "BQ91YHQ",
        }
      }
      const response = await certificateDownloadService.getCertificate('1_1B7GG36N12S678410_1.base64', 'cvs-cert-local');
      expect(response.Body).toEqual(expectedResponse.Body);
      expect(response.Metadata).toEqual(expectedResponse.Metadata);
    });
    it('should bubble up error from S3 Client', async () => {
      // Remove bucket so download fails
      S3BucketMockService.buckets.pop();
      expect.assertions(1);
      try {
        await certificateDownloadService.getCertificate('1_1B7GG36N12S678410_1.base64', 'cvs-cert-local');
      } catch (e) {
        // @ts-ignore
        expect(e.message).toBe('The specified bucket does not exist.');
      }
    });
  });
});
