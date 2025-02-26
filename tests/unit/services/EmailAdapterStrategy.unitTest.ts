import "reflect-metadata";
import { CertificateEmail } from "../../../src/emailers/CertificateEmail";
import { LetterEmail } from "../../../src/emailers/LetterEmail";
import { PlateEmail } from "../../../src/emailers/PlateEmail";
import { TflFeedEmail } from "../../../src/emailers/TflFeedEmail";
import { IGetObjectCommandOutput } from "../../../src/models";
import { EmailAdapterStrategy } from "../../../src/services/EmailAdapterStrategy";
import { NotificationService } from "../../../src/services/NotificationService";
import { AntsFeedEmail } from '../../../src/emailers/AntsFeedEmail';
import { VtgVtpEmail } from '../../../src/emailers/VtgVtpEmail';

describe('email adapter strategy', () => {
    const notificationService: NotificationService = new NotificationService();

    it('should identify and return a certificate email', () => {
        const certificate: IGetObjectCommandOutput = {
            Metadata: {
                'cert-type': 'PSV_PASS',
            },
        } as unknown as IGetObjectCommandOutput;
        const emailStrat = new EmailAdapterStrategy(notificationService);

        const res = emailStrat.getStrategy('filename', certificate);

        expect(res).toBeInstanceOf(CertificateEmail)
    })
    it('should identify and return a plate email', () => {
        const certificate: IGetObjectCommandOutput = {
            Metadata: {
                'document-type': 'VTG6_VTG7',
            },
        } as unknown as IGetObjectCommandOutput;
        const emailStrat = new EmailAdapterStrategy(notificationService);

        const res = emailStrat.getStrategy('filename', certificate);

        expect(res).toBeInstanceOf(PlateEmail)
    })
    it('should identify and return a letter email', () => {
        const certificate: IGetObjectCommandOutput = {
            Metadata: {
                'document-type': 'TrailerIntoService',
            },
        } as unknown as IGetObjectCommandOutput;
        const emailStrat = new EmailAdapterStrategy(notificationService);

        const res = emailStrat.getStrategy('filename', certificate);

        expect(res).toBeInstanceOf(LetterEmail)
    })
    it('should identify and return a tfl feed email', () => {
        const certificate: IGetObjectCommandOutput = {
            Metadata: {
                'document-type': 'does not matter',
            },
        } as unknown as IGetObjectCommandOutput;
        const emailStrat = new EmailAdapterStrategy(notificationService);

        const res = emailStrat.getStrategy('VOSA_FILE.csv', certificate);

        expect(res).toBeInstanceOf(TflFeedEmail)
    })
    it('should identify and return a ants feed email', () => {
        const certificate: IGetObjectCommandOutput = {
            Metadata: {
                'document-type': 'does not matter',
            },
        } as unknown as IGetObjectCommandOutput;
        const emailStrat = new EmailAdapterStrategy(notificationService);

        const res = emailStrat.getStrategy('ANTS_FILE.csv', certificate);

        expect(res).toBeInstanceOf(AntsFeedEmail)
    })
    it('should identify and return a VtgVtpEmail feed email', () => {
        const certificate: IGetObjectCommandOutput = {
            Metadata: {
                'cert-type': 'VTG12',
            },
        } as unknown as IGetObjectCommandOutput;
        const emailStrat = new EmailAdapterStrategy(notificationService);

        const res = emailStrat.getStrategy('cert_file.csv', certificate);

        expect(res).toBeInstanceOf(VtgVtpEmail)
    })
    it('should identify and return a VtgVtpEmail feed email', () => {
        const certificate: IGetObjectCommandOutput = {
            Metadata: {
                'cert-type': 'VTP12',
            },
        } as unknown as IGetObjectCommandOutput;
        const emailStrat = new EmailAdapterStrategy(notificationService);

        const res = emailStrat.getStrategy('cert_file.csv', certificate);

        expect(res).toBeInstanceOf(VtgVtpEmail)
    })
    it('should throw an error if no email type is found', () => {
        const certificate: IGetObjectCommandOutput = {
            Metadata: {
                'document-type': 'not found',
            },
        } as unknown as IGetObjectCommandOutput;
        const emailStrat = new EmailAdapterStrategy(notificationService);

        expect(() => {emailStrat.getStrategy('filename', certificate)}).toThrow('Unsupported DocumentType')
    })
})