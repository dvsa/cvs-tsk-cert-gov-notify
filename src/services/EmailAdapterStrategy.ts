import { Service } from 'typedi';
import { AntsFeedEmail } from '../emailers/AntsFeedEmail';
import { CertificateEmail } from '../emailers/CertificateEmail';
import { LetterEmail } from '../emailers/LetterEmail';
import { PlateEmail } from '../emailers/PlateEmail';
import { TflFeedEmail } from '../emailers/TflFeedEmail';
import { VtgVtpEmail } from '../emailers/VtgVtpEmail';
import { DocumentTypes, IGetObjectCommandOutput } from '../models';
import { NotificationService } from './NotificationService';

@Service()
export class EmailAdapterStrategy {
	constructor(private notificationService: NotificationService) {}

	public getStrategy(filename: string, certificate: IGetObjectCommandOutput) {
		if (filename.includes('VOSA')) {
			return new TflFeedEmail(this.notificationService);
		}

		if (filename.includes('ANTS')) {
			return new AntsFeedEmail(this.notificationService);
		}

		if (certificate.Metadata!['cert-type'] === 'VTG12' || certificate.Metadata!['cert-type'] === 'VTP12') {
			return new VtgVtpEmail(this.notificationService);
		}

		if (certificate.Metadata!['cert-type']) {
			return new CertificateEmail(this.notificationService);
		}

		if (certificate.Metadata!['document-type'] === DocumentTypes.MINISTRY_PLATE) {
			return new PlateEmail(this.notificationService);
		}

		if (certificate.Metadata!['document-type'] === DocumentTypes.TRAILER_INTO_SERVICE) {
			return new LetterEmail(this.notificationService);
		}

		throw new Error('Unsupported DocumentType');
	}
}
