import bcrypt from "bcryptjs";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { User } from "../../entity/User";
import { MyContext } from "../../types/MyContext";

@Resolver()
export class LoginResolver {
  // @Query(() => String)
  // async helloWorld() {
  //   return "Hello";
  // }

  @Mutation(() => User, { nullable: true })
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: MyContext
  ): Promise<User | null> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return null;
    }

    //Receiving a cookie
    ctx.req.session!.userId = user.id;
    return user;
  }
}
