import {searchUsersByName} from "../../users/repositories/user.repository";

export const searchUsersService = async (name: string) => {
    const users = await searchUsersByName(name);

    if (users.length === 0) {
        return [];
    }

    return users.map(user => ({
        username: user.username,
        user_fullname: user.full_name,
        profile_picture: user.profile_picture,
        id: user.id
    }));
}