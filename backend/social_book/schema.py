import graphene
from core.schema import Query as CRMQuery, Mutation as CRMMutation

# Combine all queries
class Query(CRMQuery, graphene.ObjectType):
    pass

# Combine all mutations
class Mutation(CRMMutation, graphene.ObjectType):
    pass

# Create the GraphQL schema
schema = graphene.Schema(query=Query, mutation=Mutation)