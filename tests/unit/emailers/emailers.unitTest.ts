import "reflect-metadata";
import { CertificateEmail } from "../../../src/emailers/CertificateEmail";
import { LetterEmail } from "../../../src/emailers/LetterEmail";
import { PlateEmail } from "../../../src/emailers/PlateEmail";
import { TflFeedEmail } from "../../../src/emailers/TflFeedEmail";
import { IGetObjectCommandOutput } from "../../../src/models";
import { NotificationService } from "../../../src/services/NotificationService";

describe('EmailRequestFactory', () => {
    const notificationService: NotificationService = new NotificationService();

    beforeEach(() => {
        jest.resetAllMocks();
    })

    describe('CertificateRecord', () => {
        it('should return me correct partial params for a certificate record', async () => {
            const certificate: IGetObjectCommandOutput = {
                Metadata: {
                    'vrm': 'BQ91YHQ',
                    'test-type-name': 'Annual test',
                    'date-of-issue': '11 March 2019',
                    'total-certs': '2',
                    'test-type-result': 'prs',
                    'cert-type': 'PSV_PRS',
                    'cert-index': '1',
                    'file-format': 'pdf',
                    'file-size': '306784',
                    'should-email-certificate': 'true',
                    'email': 'testemail@testdomain.com',
                },
                Body: '1234' as unknown as Buffer,
            } as unknown as IGetObjectCommandOutput;

            const documentRecord = new CertificateEmail(notificationService);
            const spy = jest.spyOn(notificationService, 'sendNotification').mockResolvedValue((void 0));

            await documentRecord.sendEmail(certificate);

            expect(spy).toHaveBeenCalledWith(
                {
                    email: 'testemail@testdomain.com',
                    shouldEmail: 'true',
                    fileData: '1234',
                    documentType: 'certificate',
                    personalisation: {
                        vrms: 'BQ91YHQ',
                        test_type_name: 'Annual test',
                        date_of_issue: '11 March 2019',
                        total_certs: '2',
                        test_type_result: 'prs',
                        cert_type: 'PSV_PRS',
                        cert_index: '1',
                        file_format: 'pdf',
                        file_size: '306784',
                    },
                }
            )
        });
    })

    describe('LetterRecord', () => {
        it('should return me correct partial params for a letter record', async () => {
            const certificate: IGetObjectCommandOutput = {
                Metadata: {
                    'document-type': 'TrailerIntoService',
                    'trailer-id': '12345',
                    'date-of-issue': '12345',
                    'email': 'test@test.com',
                    'should-email-certificate': 'true',
                  },
                  Body: '1234' as unknown as Buffer,
            } as unknown as IGetObjectCommandOutput;
            const documentRecord = new LetterEmail(notificationService);
            const spy = jest.spyOn(notificationService, 'sendNotification').mockResolvedValue((void 0));

            await documentRecord.sendEmail(certificate);

            expect(spy).toHaveBeenCalledWith(
                {
                    email: 'test@test.com',
                    shouldEmail: 'true',
                    fileData: '1234',
                    documentType: 'TrailerIntoService',
                    personalisation: {
                        trailer_id: '12345',
                        date_of_issue: '12345',
                    },
                }
            )
        });
    })

    describe('PlateRecord', () => {
        it('should return me correct partial params for a plate record', async () => {
            const certificate: IGetObjectCommandOutput = {
                Metadata: {
                    'document-type': 'VTG6_VTG7',
                    'vrm': '12345',
                    'date-of-issue': '12345',
                    'email': 'test@test.com',
                    'should-email-certificate': 'true',
                  },
                  Body: '1234' as unknown as Buffer,
            } as unknown as IGetObjectCommandOutput;
            const documentRecord = new PlateEmail(notificationService);
            const spy = jest.spyOn(notificationService, 'sendNotification').mockResolvedValue((void 0));

            await documentRecord.sendEmail(certificate);

            expect(spy).toHaveBeenCalledWith(
                {
                    email: 'test@test.com',
                    shouldEmail: 'true',
                    fileData: '1234',
                    documentType: 'VTG6_VTG7',
                    personalisation: {
                        vrms: '12345',
                        date_of_issue: '12345',
                    },
                }
            )
        });
    })

    describe('TFLFeed', () => {
        it('should return me correct partial params for a TFL feed record', async () => {
            process.env.TFL_EMAIL_LIST = 'email1@email.com'
            const certificate: IGetObjectCommandOutput = {
                Metadata: {},
                Body: '1234' as unknown as Buffer,
            } as unknown as IGetObjectCommandOutput;
            const documentRecord = new TflFeedEmail(notificationService);
            const spy = jest.spyOn(notificationService, 'sendNotification').mockResolvedValue((void 0));

            await documentRecord.sendEmail(certificate);

            expect(spy).toHaveBeenCalledWith(
                {
                    email: 'email1@email.com',
                    shouldEmail: 'true',
                    fileData: '1234',
                    documentType: 'TFL_FEED',
                    personalisation: {},
                }, true
            )
            expect(spy).toHaveBeenCalledTimes(1)
        });
        it('should allow me to send two emails with the values overwritten', async () => {
            process.env.TFL_EMAIL_LIST = 'email1@email.com,email2@email.com'
            const certificate: IGetObjectCommandOutput = {
                Metadata: {},
                Body: '1234' as unknown as Buffer,
            } as unknown as IGetObjectCommandOutput;
            const documentRecord = new TflFeedEmail(notificationService);
            const spy = jest.spyOn(notificationService, 'sendNotification').mockResolvedValue((void 0));

            await documentRecord.sendEmail(certificate);

            expect(spy).toHaveBeenCalledWith({
                email: 'email2@email.com',
                shouldEmail: 'true',
                fileData: '1234',
                documentType: 'TFL_FEED',
                personalisation: {},
            }, true)
            expect(spy).toHaveBeenCalledTimes(2)
        })
        it('should not send any in the env var is not defined', async () => {
            delete process.env.TFL_EMAIL_LIST
            const certificate: IGetObjectCommandOutput = {
                Metadata: {},
                Body: '1234' as unknown as Buffer,
            } as unknown as IGetObjectCommandOutput;
            const documentRecord = new TflFeedEmail(notificationService);
            const spy = jest.spyOn(notificationService, 'sendNotification').mockResolvedValue((void 0));

            await documentRecord.sendEmail(certificate);
            expect(spy).not.toHaveBeenCalled();
        })
    })
})