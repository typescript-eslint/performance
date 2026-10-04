import { entitySchemas } from "./createFrameworkFile.ts";

export type ModuleCreator = (
	index: number,
	dependencies?: readonly ModuleDependency[],
) => string;

export interface ModuleDependency {
	index: number;
	path: string;
}

// Example directories with nested directories hold modules 0 and 1 in nested1 and nested2.
export const nestedDependencies: readonly ModuleDependency[] = [
	{ index: 0, path: "./nested1/index.js" },
	{ index: 1, path: "./nested2/index.js" },
];

// Every module exports `example${index}`, resolving to a `Summary${index}` with a `total`,
// so modules can call their dependencies no matter how complex either one is.
type ModuleKindCreator = (
	index: number,
	dependencies: readonly ModuleDependency[],
) => string;

// Like typical app code, 85% of modules only use plain types of their own (and the
// framework's), 10% declare generics, and 5% declare result unions or fancier types.
const advancedModules = new Map<number, ModuleKindCreator>([
	[3, createGenericModule],
	[8, createResultModule],
	[13, createGenericModule],
	[23, createGenericModule],
	[28, createComplexModule],
	[33, createGenericModule],
]);

const modulePattern: readonly ModuleKindCreator[] = Array.from(
	{ length: 40 },
	(_, position) =>
		advancedModules.get(position) ??
		(position % 5 === 0 || position % 5 === 2
			? createSuperSimpleModule
			: createSimpleModule),
);

// Like real code, most files are short and a few are long: lines per file are skewed
// right, with a median around 65 and a mean around 100.
const sizeTargets = [
	8, 11, 15, 19, 23, 27, 31, 36, 41, 48, 55, 62, 72, 84, 100, 119, 144, 175,
	212, 262,
];

/** Creates modules in a repeating pattern of mostly plain modules, with a few advanced ones. */
export function createModuleCycle(): ModuleCreator {
	let created = 0;

	return (index, dependencies = []) => {
		const position = created++;
		const module = modulePattern[position % modulePattern.length](
			index,
			dependencies,
		);
		const target = sizeTargets[(position * 7) % sizeTargets.length];
		const helpers = createHelpers(index, target - countLines(module));

		return helpers.includes("framework.")
			? `import * as framework from "@app/framework";\n${module}\n${helpers}`
			: `${module}\n${helpers}`;
	};
}

function countLines(text: string) {
	return text.split("\n").filter((line) => line.trim()).length;
}

// Plain app-style helpers without generics or fancy types, used to fill modules out to size.
const helperCreators: readonly ((id: string, seed: number) => string)[] = [
	(id) => `
		export function buildLabel${id}(parts: readonly string[], separator = " / "): string {
			return parts
				.map((part) => part.trim())
				.filter((part) => part.length > 0)
				.join(separator);
		}
	`,
	(id) => `
		export function formatAmount${id}(amount: number, currency = "USD"): string {
			const rounded = Math.round(amount * 100) / 100;
			const sign = rounded < 0 ? "-" : "";
			return \`\${sign}\${currency} \${Math.abs(rounded).toFixed(2)}\`;
		}
	`,
	(id, seed) => `
		export function isStale${id}(entity: framework.Entity, now = new Date()): boolean {
			if (entity.status === "archived") {
				return false;
			}

			const ageInDays = (now.getTime() - entity.createdAt.getTime()) / 86_400_000;
			return ageInDays > ${30 + (seed % 60)} && entity.tags.length === 0;
		}
	`,
	(id) => `
		export async function loadName${id}(id: string, fallback: string): Promise<string> {
			try {
				const entity = await framework.load(id);
				return entity ? framework.format(entity) : fallback;
			} catch (error) {
				console.error(\`Failed to load \${id}\`, error);
				return fallback;
			}
		}
	`,
	(id, seed) => `
		const limits${id} = {
			daily: ${10 + (seed % 90)},
			monthly: ${300 + (seed % 900)},
			weekly: ${70 + (seed % 200)},
		};

		export function getLimit${id}(period: string): number {
			return period === "monthly"
				? limits${id}.monthly
				: period === "weekly"
					? limits${id}.weekly
					: limits${id}.daily;
		}
	`,
	(id) => `
		export function summarizeValues${id}(values: readonly number[]): {
			average: number;
			max: number;
			min: number;
		} {
			if (values.length === 0) {
				return { average: 0, max: 0, min: 0 };
			}

			let total = 0;
			for (const value of values) {
				total += value;
			}

			return { average: total / values.length, max: Math.max(...values), min: Math.min(...values) };
		}
	`,
];

function createComplexModule(
	index: number,
	dependencies: readonly ModuleDependency[],
) {
	return `
		${createImports(dependencies)}

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

		export type Getters${index}<T> = {
			[K in keyof T & string as \`get\${Capitalize<K>}\`]: () => T[K];
		};

		export type Unwrapped${index}<T> = T extends Promise<infer U> ? U : T;

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

		export function describe${index}(value: Date): string;
		export function describe${index}(value: number): string;
		export function describe${index}(value: Date | number): string {
			return typeof value === "number" ? value.toFixed(2) : value.toISOString();
		}

		export function createItem${index}(prefix: string, offset: number): Item${index} {
			return {
				createdAt: new Date(offset * 1000),
				id: \`\${prefix}-${index}-\${offset.toString()}\`,
				metadata: offset % 3 === 0 ? { priority: offset, source: prefix } : undefined,
				name: \`Item \${describe${index}(offset)}\`,
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

			${createDependencyTotal(dependencies)}

			const summary: Unwrapped${index}<ReturnType<typeof example${index}>> = summarize${index}(
				repository.list((item) => item.status !== "pending"),
				dependencyTotal,
			);
			const getters: Pick<Getters${index}<Summary${index}>, "getTotal"> = {
				getTotal: () => summary.total,
			};

			return { ...summary, total: getters.getTotal() };
		}
	`;
}

function createDependencyTotal(dependencies: readonly ModuleDependency[]) {
	return dependencies.length > 0
		? `const dependencySummaries: [${dependencies
				.map((dependency) => `Summary${dependency.index}`)
				.join(", ")}] = await Promise.all([${dependencies
				.map((dependency) => `example${dependency.index}(prefix)`)
				.join(", ")}]);
			const dependencyTotal = dependencySummaries.reduce((total, summary) => total + summary.total, 0);`
		: "const dependencyTotal = 0;";
}

function createGenericModule(
	index: number,
	dependencies: readonly ModuleDependency[],
) {
	return `
		${createImports(dependencies)}

		export interface Summary${index} {
			groups: number;
			total: number;
		}

		export interface Keyed${index} {
			readonly key: string;
		}

		export class Cache${index}<K, V> {
			readonly #entries = new Map<K, V>();

			get(key: K, create: (key: K) => V): V {
				const existing = this.#entries.get(key);
				if (existing !== undefined) {
					return existing;
				}

				const created = create(key);
				this.#entries.set(key, created);
				return created;
			}
		}

		export function groupBy${index}<T, K extends PropertyKey>(
			items: readonly T[],
			getKey: (item: T) => K,
		): Map<K, T[]> {
			const groups = new Map<K, T[]>();
			for (const item of items) {
				const key = getKey(item);
				const group = groups.get(key);
				if (group) {
					group.push(item);
				} else {
					groups.set(key, [item]);
				}
			}

			return groups;
		}

		export async function example${index}(prefix: string): Promise<Summary${index}> {
			${createDependencyTotal(dependencies)}
			await Promise.resolve();

			const cache = new Cache${index}<string, Keyed${index}[]>();
			const items = cache.get(prefix, (key) => [
				{ key: \`\${key}a\` },
				{ key: \`\${key}bb\` },
				{ key: \`\${key}a\` },
			]);
			const groups = groupBy${index}(items.map((item) => item.key), (key) => key.length);

			return { groups: groups.size, total: items.length + dependencyTotal };
		}
	`;
}

function createHelpers(index: number, lines: number) {
	const helpers: string[] = [];
	let remaining = lines;
	for (let count = 0; remaining > 4; count++) {
		const seed = index * 31 + count;
		const helper = helperCreators[seed % helperCreators.length](
			`${index}_${count}`,
			seed,
		);
		helpers.push(helper);
		remaining -= countLines(helper);
	}

	return helpers.join("\n");
}

function createImports(dependencies: readonly ModuleDependency[]) {
	return dependencies
		.map(
			(dependency) =>
				`import { example${dependency.index}, type Summary${dependency.index} } from "${dependency.path}";`,
		)
		.join("\n");
}

function createResultModule(
	index: number,
	dependencies: readonly ModuleDependency[],
) {
	return `
		${createImports(dependencies)}

		export interface Summary${index} {
			failures: string[];
			total: number;
		}

		export type Result${index}<T> =
			| { error: string; ok: false }
			| { ok: true; value: T };

		export type Event${index} =
			| { amount: number; kind: "deposit" }
			| { amount: number; kind: "withdrawal" }
			| { kind: "close"; reason: string };

		export function parseAmount${index}(input: string): Result${index}<number> {
			const amount = Number(input);
			return Number.isFinite(amount) && amount >= 0
				? { ok: true, value: amount }
				: { error: \`Invalid amount: \${input}\`, ok: false };
		}

		export function applyEvent${index}(balance: number, event: Event${index}): Result${index}<number> {
			switch (event.kind) {
				case "close":
					return balance === 0
						? { ok: true, value: 0 }
						: { error: \`Cannot close: \${event.reason}\`, ok: false };
				case "deposit":
					return { ok: true, value: balance + event.amount };
				case "withdrawal":
					return event.amount > balance
						? { error: "Insufficient funds", ok: false }
						: { ok: true, value: balance - event.amount };
			}
		}

		export async function example${index}(prefix: string): Promise<Summary${index}> {
			${createDependencyTotal(dependencies)}
			await Promise.resolve();

			const failures: string[] = [];
			let balance = 0;
			for (const input of [prefix.length.toString(), "12", "-3"]) {
				const amount = parseAmount${index}(input);
				if (!amount.ok) {
					failures.push(amount.error);
					continue;
				}

				const applied = applyEvent${index}(balance, { amount: amount.value, kind: "deposit" });
				if (applied.ok) {
					balance = applied.value;
				} else {
					failures.push(applied.error);
				}
			}

			return { failures, total: balance + dependencyTotal };
		}
	`;
}

function createSimpleModule(
	index: number,
	dependencies: readonly ModuleDependency[],
) {
	const [first, second, third] = [0, 1, 2].map(
		(offset) => entitySchemas[(index * 3 + offset) % entitySchemas.length],
	);

	return `
		${createImports(dependencies)}
		import { defineHandlers, type Entity, findEntities, isKind, load } from "@app/framework";

		export interface Summary${index} {
			labels: string[];
			total: number;
		}

		export const handlers${index} = defineHandlers({
			${first.kind}(entity, context) {
				if (entity.${first.count} < 0) {
					context.report("${first.kind} has a negative ${first.count}", entity);
				}
			},
			${second.kind}(entity, context) {
				if (entity.status === "archived" && !entity.${second.flag}) {
					context.report(\`\${entity.name} is archived\`, entity);
				}
			},
			async ${third.kind}(entity, context) {
				const owner = entity.owner && (await load(entity.owner.id));
				if (!owner) {
					context.report(\`\${entity.${third.label}} has no owner\`, entity);
				}
			},
		});

		function describe${index}(entity: Entity): string {
			if (isKind(entity, "${first.kind}")) {
				return \`\${entity.name}: \${entity.${first.count}.toString()}\`;
			}
			if (isKind(entity, "${second.kind}")) {
				return entity.${second.flag} ? entity.name : entity.status;
			}
			return entity.tags.join(", ");
		}

		export async function example${index}(prefix: string): Promise<Summary${index}> {
			${createDependencyTotal(dependencies)}
			const entities = await findEntities("${first.kind}", (entity) => entity.name.startsWith(prefix));
			const labels = entities
				.filter((entity) => entity.${first.count} > 0)
				.map((entity) => describe${index}(entity));

			return { labels, total: labels.length + dependencyTotal };
		}
	`;
}

function createSuperSimpleModule(index: number) {
	return `
		import { format, load } from "@app/framework";

		export interface Summary${index} {
			total: number;
		}

		export async function example${index}(prefix: string): Promise<Summary${index}> {
			const entity = await load(\`\${prefix}${index}\`);
			return { total: entity ? format(entity).length : prefix.length + ${index} };
		}
	`;
}
