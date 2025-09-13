import { gql } from "@apollo/client";


export const LOGIN_MUTATION = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
    }
  }
`;
export const VERIFY_MUTATION = gql`
  mutation VerifyToken($token:String!) {
    verifyToken(token:$token){
        payload
    }
  }
`;
export const REFRESH_MUTATION = gql`
  mutation RefreshToken($token:String!) {
    refreshToken(token:$token){
        token
        payload
    }
  }
`;



export const GET_FEED = gql`
    query GetFeedData {
        feed{
            id
            user{
                id
                username
                firstName
                lastName
                profile{
                    profileimg
                }
            }
            image
            caption
            createdAt
            likes{
                user{
                    username
                    id
                    profile{
                        profileimg
                    }
                }
            }
        }
        suggestions {
            id
            user {
            username
            email
            firstName
            lastName
            }
            bio
            profileimg
            followersCount
            followingCount
            isFollowing
        }
        }
`

export const GET_MY_PROFILE = gql`
    query getMyProfile {
      myProfile {
          user{
          username
          firstName
          lastName
          }
          profileimg
      }
}
`

export const GET_PROFILE = gql`
    query getProfile($username:String!) {
        profile(username:$username) {
          id
          bio
          location
          followersCount
          isFollowing
          followingCount
          profileimg
          user{
            id
            firstName
            lastName
            username
            dateJoined
            posts{
              id
              image
              caption
              createdAt
              likes{
                user{
                  username
                }
              }
            }
          }
        }
}
`