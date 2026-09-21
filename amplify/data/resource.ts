import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  UserProfile: a
    .model({
      name: a.string().required(),
      email: a.string(),
      currency: a.string(),
    })
    .authorization((allow: any) => [
      allow.owner(),
    ]),

  Trip: a
    .model({
      title: a.string().required(),
      destination: a.string().required(),
      startDate: a.string(),
      endDate: a.string(),
      budget: a.float(),
      status: a.string(),
    })
    .authorization((allow: any) => [
      allow.owner(),
    ]),

  Expense: a
    .model({
      category: a.string().required(),
      amount: a.float().required(),
      description: a.string(),
      date: a.string(),
      tripId: a.string(),
    })
    .authorization((allow: any) => [
      allow.owner(),
    ]),

  TripExpense: a
    .model({
      tripId: a.string().required(),
      category: a.string().required(),
      amount: a.float().required(),
      description: a.string(),
      date: a.string(),
    })
    .authorization((allow: any) => [
      allow.owner(),
    ]),

  RecoveryPlan: a
    .model({
      tripId: a.string().required(),
      projectedSpend: a.float(),
      recoveryApplied: a.boolean(),
      recoveryDetails: a.string(),
    })
    .authorization((allow: any) => [
      allow.owner(),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});