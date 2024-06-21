---
title: "Understanding Database Relationships"
summary: "A quick look at One-to-One, One-to-Many, and Many-to-Many relationships in databases."
createdAt: "2024-06-21"
tags: ['database', 'sql']
image: '/images/posts/general/database.png'
---

## Introduction

When designing a database, understanding the types of relationships between tables is crucial. These relationships define how data in one table is related to data in another. In this post, we'll explore three main types of relationships: one-to-one, one-to-many, and many-to-many.

![data-model](/images/posts/understanding-database-relationships/understanding-database-relationships.png)


## Terminology

- **Table:** A collection of related data organized in rows and columns.
- **Primary Key (PK):** A unique identifier for each record in a table. A column is marked as a primary key to ensure data integrity.
- **Foreign Key (FK):** A column in a table that references the primary key of another table.
- **Join Table:** A table used to establish a many-to-many relationship between two tables.

## Relationship Types

These relationships are related to Structured Query Language (SQL) databases but same concepts can be applied to other types of databases as well with some variations.

### One-to-One Relationships

A one-to-one relationship is established when a single record in one table is linked to a single record in another table, using a foreign key to reference the primary key of the other table.


Example: Users and UserDetails

In this scenario, each user has a unique set of details. The purpose of creating a separate table for user details is to avoid redundancy and to keep the database normalized.

```sql
**Users table:**

| id  | userName | email | passwordHash  |
| --- | -------- | ----- | ------------- |
| 0   | -        | -     | -             |
| 1   | -        | -     | -             |

**UserDetails table:**

| id  | user_id | fullName  | birthDate  | address |
| --- | ------- | --------- | ---------- | ------- |
| 0   | 0       | -         | -          | -       |
| 1   | 1       | -         | -          | -       |

```

In this example, the `user_id` column in the `UserDetails` table references the `id` column in the `Users` table, creating a one-to-one relationship. Each user has only one set of details.

### One-to-Many Relationships

A one-to-many relationship occurs when a single record in one table is associated with multiple records in another table. This is achieved by using a foreign key in the "many" table to reference the primary key in the "one" table.

Example: Users and Authentications

Here, each user can have multiple authentication tokens, representing logins from different devices.

```sql

**Users table:**

| id  | username | email | passwordHash  |
| --- | -------- | ----- | ------------- |
| 0   | -        | -     | -             |
| 1   | -        | -     | -             |

**Authentications table:**

| id  | user_id | token | expiresAt  |
| --- | ------- | ----- | ---------- |
| 0   | 1       | -     | -          |
| 1   | 1       | -     | -          |
| 2   | 2       | -     | -          |
  
```

In this case, the `user_id` column in the `Authentications` table references the `id` column in the `Users` table, establishing a one-to-many relationship. A single user can have multiple authentication records.

### Many-to-Many Relationships

A many-to-many relationship occurs when multiple records in one table are associated with multiple records in another table. To represent this relationship, a join table is created to connect the two tables through foreign keys.


Example: Users and Roles

Here, a user can have multiple roles, and each role can be assigned to multiple users.


```sql
**Users table:**

| id  | username | email | passwordHash  |
| --- | -------- | ----- | ------------- |
| 0   | -        | -     | -             |
| 1   | -        | -     | -             |

**Roles table:**

| id  | name     |
| --- | -------- |
| 0   | -        |
| 1   | -        |

**UserRoles table:**

| id  | user_id | role_id |
| --- | ------- | ------- |
| 0   | 1       | 1       |
| 1   | 1       | 2       |
| 2   | 2       | 1       |
| 3   | 2       | 0       |

```

In this scenario, the `UserRoles` table has `user_id` and `role_id` columns that reference the `id` columns in the `Users` and `Roles` tables, respectively. 

## Conclusion

By mastering these types of relationships, you can build databases that accurately reflect the real-world scenarios they're designed to support. This will make your applications easier to maintain. So dive in, practice these concepts, and see how they can improve your database designs.


## Diagram as code reference

Following is a diagram as code that represents the relationships discussed in this post and can be utilized in <a href="https://eraser.io" target="_blank">eraser.io</a>.

```ts
users [icon: data, color: blue] {
  id string pk
  userName string
  email string
  passwordHash string
}

userDetails [icon: data, color: yellow] {
  id string pk
  fullName string
  birthDate string
  adress string
}

authentications [icon: data, color: green] {
  id string pk
  token string
  expiresAt number
}

roles [icon: data, color: purple] {
  id string pk
  name string
}

userDetails.user_id - users.id
users.id < authentications.user_id
roles.id <> users.id
```