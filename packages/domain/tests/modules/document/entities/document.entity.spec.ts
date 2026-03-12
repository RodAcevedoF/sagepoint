import { Document, DocumentStatus } from '../../../../src';

function buildDocument() {
	return Document.create('d1', 'report.pdf', '/uploads/report.pdf', 'u1');
}

describe('Document', () => {
	describe('create', () => {
		it('creates a document with PENDING status', () => {
			const doc = buildDocument();

			expect(doc.id).toBe('d1');
			expect(doc.filename).toBe('report.pdf');
			expect(doc.storagePath).toBe('/uploads/report.pdf');
			expect(doc.userId).toBe('u1');
			expect(doc.status).toBe(DocumentStatus.PENDING);
			expect(doc.errorMessage).toBeUndefined();
		});
	});

	describe('state transitions', () => {
		const transitions: Array<{
			method: keyof Document;
			args?: unknown[];
			expectedStatus: DocumentStatus;
			description: string;
		}> = [
			{
				method: 'markAsProcessing',
				expectedStatus: DocumentStatus.PROCESSING,
				description: 'PENDING → PROCESSING',
			},
			{
				method: 'markAsCompleted',
				expectedStatus: DocumentStatus.COMPLETED,
				description: 'PENDING → COMPLETED',
			},
		];

		for (const { method, expectedStatus, description } of transitions) {
			it(`transitions ${description}`, () => {
				const doc = buildDocument();
				const updated = (doc[method] as () => Document)();

				expect(updated.status).toBe(expectedStatus);
				expect(updated).not.toBe(doc);
			});
		}

		it('transitions to FAILED with error message', () => {
			const doc = buildDocument().markAsFailed('Parse error');

			expect(doc.status).toBe(DocumentStatus.FAILED);
			expect(doc.errorMessage).toBe('Parse error');
		});
	});

	describe('immutability', () => {
		it('preserves original document on state change', () => {
			const original = buildDocument();
			const processing = original.markAsProcessing();

			expect(original.status).toBe(DocumentStatus.PENDING);
			expect(processing.status).toBe(DocumentStatus.PROCESSING);
		});
	});
});
