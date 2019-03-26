import bcryptjs from "bcryptjs";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../../entity/User";
import { RegisterInput } from "./register/RegisterInput";

@Resolver(User)
export class RegisterResolver {
  @Query(() => String)
  async helloWorld() {
    return "Hello";
  }

  @Mutation(() => User)
  //Register Mutation
  async register(@Arg("data")
  {
    firstName,
    lastName,
    email,
    password
  }: RegisterInput): Promise<User> {
    const hashedPassword = await bcryptjs.hash(password, 12);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword
    }).save();

    return user;
  }
}
