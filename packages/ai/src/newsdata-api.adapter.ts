import { NewsArticle } from '@sagepoint/domain';
import type { INewsService } from '@sagepoint/domain';

const CATEGORY_SEARCH_MAP: Record<string, string> = {
	'web-development': 'web development OR frontend OR backend OR fullstack',
	'mobile-development': 'mobile development OR iOS OR Android OR React Native',
	'machine-learning':
		'machine learning OR deep learning OR neural network OR AI',
	'data-science': 'data science OR data analysis OR statistics',
	devops: 'devops OR CI/CD OR kubernetes OR docker',
	cybersecurity: 'cybersecurity OR penetration testing OR vulnerability',
	'cloud-computing': 'cloud computing OR AWS OR Azure OR GCP OR serverless',
	databases: 'database OR SQL OR NoSQL OR PostgreSQL OR MongoDB',
	'programming-languages':
		'programming language OR Python OR JavaScript OR Rust OR Go',
	'system-design':
		'system design OR software architecture OR scalability OR distributed systems',
};

interface NewsdataArticle {
	title: string;
	description: string | null;
	link: string;
	image_url: string | null;
	source_name: string;
	pubDate: string;
	ai_summary: string | null;
	duplicate: boolean;
}

interface NewsdataResponse {
	status: string;
	totalResults: number;
	results: NewsdataArticle[];
}

export interface NewsdataApiConfig {
	apiKey: string;
}

const BASE_URL = 'https://newsdata.io/api/1/latest';
const PAID_ONLY = 'ONLY AVAILABLE IN PAID PLANS';

function isUsable(text: string | null): text is string {
	return !!text && !text.includes(PAID_ONLY);
}

function pickDescription(aiSummary: string | null, description: string | null): string {
	if (isUsable(aiSummary)) return aiSummary;
	if (isUsable(description)) return description;
	return '';
}

export class NewsdataApiAdapter implements INewsService {
	private readonly apiKey: string;

	constructor(config: NewsdataApiConfig) {
		this.apiKey = config.apiKey;
	}

	async fetchByCategory(slug: string, name: string): Promise<NewsArticle[]> {
		const search = CATEGORY_SEARCH_MAP[slug] ?? name;

		const params = new URLSearchParams({
			apikey: this.apiKey,
			q: search,
			language: 'en',
			category: 'technology,science',
			size: '10',
			removeduplicate: '1',
		});

		try {
			const res = await fetch(`${BASE_URL}?${params.toString()}`);

			if (!res.ok) {
				console.warn(
					`[NewsdataIO] ${res.status} for slug="${slug}": ${await res.text()}`,
				);
				return [];
			}

			const body = (await res.json()) as NewsdataResponse;

			if (body.status !== 'success' || !body.results) return [];

			return body.results
				.filter((a) => a.title && a.link)
				.slice(0, 5)
				.map(
					(a) =>
						new NewsArticle(
							a.title,
							pickDescription(a.ai_summary, a.description),
							a.link,
							a.image_url ?? null,
							a.source_name,
							a.pubDate,
							slug,
						),
				);
		} catch (error) {
			console.error(`[NewsdataIO] Failed for slug="${slug}":`, error);
			return [];
		}
	}
}
