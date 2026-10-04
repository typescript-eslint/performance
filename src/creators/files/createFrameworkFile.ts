const entityNames = [
	"account",
	"address",
	"alert",
	"approval",
	"article",
	"asset",
	"attachment",
	"audit",
	"badge",
	"booking",
	"budget",
	"campaign",
	"category",
	"channel",
	"comment",
	"contract",
	"coupon",
	"customer",
	"dashboard",
	"deal",
	"device",
	"document",
	"event",
	"expense",
	"feedback",
	"folder",
	"goal",
	"incident",
	"invoice",
	"issue",
	"lead",
	"license",
	"location",
	"meeting",
	"message",
	"milestone",
	"note",
	"notification",
	"order",
	"organization",
	"payment",
	"permission",
	"playlist",
	"policy",
	"product",
	"project",
	"refund",
	"release",
	"report",
	"review",
	"role",
	"schedule",
	"session",
	"shipment",
	"subscription",
	"survey",
	"task",
	"team",
	"ticket",
	"user",
] as const;

export interface EntitySchema {
	count: string;
	flag: string;
	kind: string;
	label: string;
	typeName: string;
}

const countNames = ["amount", "priority", "quantity", "score", "total"];
const flagNames = ["archived", "pinned", "public", "verified"];
const labelNames = ["description", "summary", "title"];

// Each entity shares a base and adds a numeric, a boolean, and a string property named
// differently per kind, so code that reads them has to narrow to the right member first.
export const entitySchemas: readonly EntitySchema[] = entityNames.map(
	(kind, index) => ({
		count: `${countNames[index % countNames.length]}${index}`,
		flag: `${flagNames[index % flagNames.length]}${index}`,
		kind,
		label: `${labelNames[index % labelNames.length]}${index}`,
		typeName: `${kind[0].toUpperCase()}${kind.slice(1)}Entity`,
	}),
);

/** Like real code reading library types such as ASTs or ORM models, most modules check against these. */
export function createFrameworkFile() {
	return `
		declare module "@app/framework" {
			export type Status = "active" | "archived" | "draft" | "pending";

			export interface BaseEntity {
				readonly createdAt: Date;
				readonly id: string;
				name: string;
				owner?: UserEntity;
				status: Status;
				tags: readonly string[];
			}

			${entitySchemas
				.map(
					(schema) => `export interface ${schema.typeName} extends BaseEntity {
				${schema.count}: number;
				${schema.flag}?: boolean;
				readonly kind: "${schema.kind}";
				${schema.label}: string;
			}`,
				)
				.join("\n\n\t\t\t")}

			export type Entity =
				${entitySchemas.map((schema) => `| ${schema.typeName}`).join("\n\t\t\t\t")};

			export type EntityKind = Entity["kind"];

			export type EntityOf<Kind extends EntityKind> = Extract<Entity, { kind: Kind }>;

			export interface Context {
				readonly settings: Readonly<Record<string, boolean | number | string>>;
				getOwner(entity: Entity): UserEntity | undefined;
				report(message: string, entity: Entity): void;
			}

			export type Handlers = {
				[Kind in EntityKind]?: (entity: EntityOf<Kind>, context: Context) => Promise<void> | void;
			};

			export function defineHandlers<const T extends Handlers>(handlers: T): T;

			export function findEntities<Kind extends EntityKind>(
				kind: Kind,
				filter?: (entity: EntityOf<Kind>) => boolean,
			): Promise<EntityOf<Kind>[]>;

			export function format(entity: Entity): string;

			export function isKind<Kind extends EntityKind>(
				entity: Entity,
				kind: Kind,
			): entity is EntityOf<Kind>;

			export function load(id: string): Promise<Entity | undefined>;
		}
	`;
}
