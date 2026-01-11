import { IConceptRepository, Concept } from '@sagepoint/domain';
import { Neo4jService } from '@sagepoint/graph';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Neo4jConceptRepository implements IConceptRepository {
  constructor(private readonly neo4j: Neo4jService) {}

  async save(concept: Concept): Promise<void> {
    const cypher = `
      MERGE (c:Concept {id: $id})
      SET c.name = $name, c.description = $description, c.documentId = $documentId
    `;
    await this.neo4j.write(cypher, {
      id: concept.id,
      name: concept.name,
      description: concept.description || '',
      documentId: concept.documentId,
    });
  }

  async findById(id: string): Promise<Concept | null> {
    const cypher = `
      MATCH (c:Concept {id: $id})
      RETURN c
    `;
    const result = await this.neo4j.read(cypher, { id });
    if (result.records.length === 0) return null;

    const record = result.records[0];
    const node = record.get('c').properties;

    return new Concept(node.id, node.name, node.documentId, node.description);
  }

  async searchByName(name: string): Promise<Concept[]> {
    const cypher = `
      MATCH (c:Concept)
      WHERE toLower(c.name) CONTAINS toLower($name)
      RETURN c
      LIMIT 10
    `;
    const result = await this.neo4j.read(cypher, { name });
    
    return result.records.map(record => {
      const node = record.get('c').properties;
      return new Concept(node.id, node.name, node.documentId, node.description);
    });
  }

  async addRelation(fromId: string, toId: string, type: 'DEPENDS_ON' | 'NEXT_STEP'): Promise<void> {
    const cypher = `
      MATCH (a:Concept {id: $fromId})
      MATCH (b:Concept {id: $toId})
      MERGE (a)-[r:${type}]->(b)
    `;
    await this.neo4j.write(cypher, { fromId, toId });
  }
}
