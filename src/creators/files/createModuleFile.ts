export interface ModuleDependency {
	index: number;
	path: string;
}

// Example directories with nested directories hold modules 0 and 1 in nested1 and nested2.
export const nestedDependencies: readonly ModuleDependency[] = [
	{ index: 0, path: "./nested1/index.js" },
	{ index: 1, path: "./nested2/index.js" },
];

export function createModuleFile(
	index: number,
	dependencies: readonly ModuleDependency[] = [],
) {
	return `
		${dependencies
			.map(
				(dependency) =>
					`import { example${dependency.index}, type Summary${dependency.index} } from "${dependency.path}";`,
			)
			.join("\n")}

		export type Status${index} = "active" | "archived" | "pending";

		export interface Item${index} {
			readonly createdAt: Date;
			readonly id: string;
			metadata?: Record<string, number | string>;
			name: string;
			status: Status${index};
			tags: readonly string[];
		}

		export type ItemPatch${index} = Partial<Omit<Item${index}, "createdAt" | "id">>;

		export type Result${index}<T> =
			| { error: Error; ok: false }
			| { ok: true; value: T };

		export interface Summary${index} {
			byStatus: Record<Status${index}, number>;
			dependencies: number;
			names: string[];
			tags: string[];
			total: number;
		}

		const statuses${index} = ["active", "archived", "pending"] as const satisfies readonly Status${index}[];

		export class Repository${index}<T extends { readonly id: string }> {
			readonly #items = new Map<string, T>();

			constructor(private readonly label: string) {}

			get size(): number {
				return this.#items.size;
			}

			async findById(id: string): Promise<T | undefined> {
				await Promise.resolve();
				return this.#items.get(id);
			}

			list(predicate?: (item: T) => boolean): T[] {
				const items = [...this.#items.values()];
				return predicate ? items.filter(predicate) : items;
			}

			async save(item: T): Promise<Result${index}<T>> {
				try {
					await Promise.resolve();
					if (!item.id) {
						return { error: new Error(\`\${this.label} items need an id\`), ok: false };
					}

					this.#items.set(item.id, item);
					return { ok: true, value: item };
				} catch (error) {
					return {
						error: error instanceof Error ? error : new Error("Unknown failure"),
						ok: false,
					};
				}
			}

			async update(id: string, patch: ItemPatch${index} & Partial<T>): Promise<Result${index}<T>> {
				const existing = await this.findById(id);
				if (existing === undefined) {
					return { error: new Error(\`\${this.label} has no item \${id}\`), ok: false };
				}

				return this.save({ ...existing, ...patch });
			}
		}

		export function createItem${index}(prefix: string, offset: number): Item${index} {
			return {
				createdAt: new Date(offset * 1000),
				id: \`\${prefix}-${index}-\${offset}\`,
				metadata: offset % 3 === 0 ? { priority: offset, source: prefix } : undefined,
				name: \`Item \${offset.toString()}\`,
				status: statuses${index}[offset % statuses${index}.length],
				tags: offset % 2 === 0 ? ["even", prefix] : ["odd"],
			};
		}

		export function summarize${index}(items: readonly Item${index}[], dependencies: number): Summary${index} {
			const byStatus: Record<Status${index}, number> = { active: 0, archived: 0, pending: 0 };
			for (const item of items) {
				byStatus[item.status] += 1;
			}

			return {
				byStatus,
				dependencies,
				names: items.map((item) => item.name.toUpperCase()).sort((a, b) => a.localeCompare(b)),
				tags: [...new Set(items.flatMap((item) => item.tags))].sort(),
				total: items.length,
			};
		}

		export async function example${index}(prefix: string): Promise<Summary${index}> {
			const repository = new Repository${index}<Item${index}>(\`\${prefix}repository${index}\`);
			const results = await Promise.all(
				Array.from({ length: 4 }, (_, offset) => repository.save(createItem${index}(prefix, offset))),
			);

			const failures = results.filter((result) => !result.ok);
			if (failures.length > 0) {
				throw new Error(\`Failed to save \${failures.length.toString()} items\`);
			}

			const archived = await repository.update(\`\${prefix}-${index}-0\`, { status: "archived" });
			if (!archived.ok) {
				throw archived.error;
			}

			${
				dependencies.length > 0
					? `const dependencySummaries: [${dependencies
							.map((dependency) => `Summary${dependency.index}`)
							.join(", ")}] = await Promise.all([${dependencies
							.map((dependency) => `example${dependency.index}(prefix)`)
							.join(", ")}]);
			const dependencyTotal = dependencySummaries.reduce((total, summary) => total + summary.total, 0);`
					: "const dependencyTotal = 0;"
			}

			return summarize${index}(
				repository.list((item) => item.status !== "pending"),
				dependencyTotal,
			);
		}
	`;
}
