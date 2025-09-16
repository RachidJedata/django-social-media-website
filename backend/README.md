# Backend Documentation

This project's backend is built with **Django** and **Django REST Framework (DRF)**, offering both a traditional **RESTful API** and a modern **GraphQL API** to handle data. API documentation is automatically generated using **DRF Spectacular**.

---

## Technology Stack

* **Framework:** Django & Django REST Framework
* **Database:** PostgreSQL
* **Authentication:** JWT (JSON Web Tokens) with `django-graphql-jwt`
* **API Schema:** Graphene-Django
* **Documentation:** DRF Spectacular
* **CORS Management:** `django-cors-headers`

---

## RESTful API Endpoints

The RESTful endpoints are designed for standard CRUD (Create, Read, Update, Delete) operations and other specific actions.

#Below is the endpoints and for more infos visit the Spectacular endpoint

| Endpoint | Method | Description | Authentication |
| :--- | :--- | :--- | :--- |
| `/api/` | `GET` | Retrieves the user's social feed and suggestions. | Required |
| `/api/signup/` | `POST` | Creates a new user account. | None |
| `/api/token/` | `POST` | Obtains a JWT token for a user. | None |
| `/api/post/` | `POST` | Creates a new post. | Required |
| `/api/post/<pk>/` | `GET` | Retrieves a single post. | Required |
| `/api/search/<username>/` | `GET` | Searches for users by username. | Required |
| `/api/like/` | `POST` | Toggles a like on a post. | Required |
| `/api/profile/<pk>/` | `GET` | Retrieves a user's profile. | Required |
| `/api/profile-settings/` | `GET`/`PATCH`| Manages the authenticated user's profile. | Required |
| `/api/follow/` | `POST` | Toggles a follow on a user. | Required |

---

## GraphQL API

The GraphQL API provides a single endpoint for efficient data fetching, allowing clients to request exactly what they need.

### Endpoint

* `http://localhost:8000/graphql/`

### Features

The schema is divided into **Queries** (for fetching data) and **Mutations** (for modifying data).

#### **Queries**

* `feed`: Fetches the authenticated user's feed, including posts from followed users and suggestions for new users to follow.
* `profile(username: String!)`: Retrieves the public profile of a specific user.
* `searchProfiles(username: String!)`: Searches for users whose usernames contain the given string.

#### **Mutations**

* `createPost`: Creates a new post for the authenticated user.
* `updateProfile`: Updates the bio and/or profile image of the authenticated user.
* `followUser`: Toggles a follow/unfollow action on a specified user.
* `likePost`: Toggles a like/unlike action on a specified post.

### Example GraphQL Query

```graphql
query {
  feed {
    id
    title
    user {
      username
    }
  }
  suggestions {
    user {
      username
    }
    bio
  }
}



python social_book/utils/consumer.py