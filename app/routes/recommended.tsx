// import { SwipeCards } from "@/components/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/ui/tabs";
// import { User } from "@/services/auth.server";
// import {
//   ActionFunctionArgs,
//   LoaderFunctionArgs,
//   json,
//   redirect,
// } from "@remix-run/cloudflare";
// import { getDBClient } from "@/lib/client.server";
// import { useFetcher, useLoaderData } from "@remix-run/react";
// import { getRecommendedPosts } from "@/features/drizzle/get/post";
// import { like } from "@/features/drizzle/mutation/like";
// import { getServerAuthSession } from "@/features/auth";

// export const loader = async ({ context, request }: LoaderFunctionArgs) => {
//   const currentUser = (await getServerAuthSession(context, request)) as User;
//   const userId = currentUser.id;

//   if (userId == null) {
//     return redirect("/login");
//   }

//   const db = getDBClient(context.cloudflare.env.DB);

//   const { posts } = await getRecommendedPosts(db, userId);

//   return json(posts);
// };

// export const action = async ({ context, request }: ActionFunctionArgs) => {
//   const currentUser = (await getServerAuthSession(context, request)) as User;
//   const userId = currentUser.id;

//   const formData = await request.formData();
//   const postId = formData.get("postId") as string;
//   const likeType = formData.get("likeType") as string;

//   const db = getDBClient(context.cloudflare.env.DB);
//   await like(db, userId, postId, likeType);

//   return null;
// };

// export default function HomePage() {
//   const posts = useLoaderData<typeof loader>();
//   const fetcher = useFetcher();

//   return (
//     <div className="h-full px-2 sm:px-8">
//       {/* TODO: classNameでheight: 100%;を指定できるようにする */}
//       <Tabs
//         defaultValue="recommend"
//         style={{ height: "100%" }}
//         className="flex flex-col"
//       >
//         <div className="flex h-16 sm:flex-1 items-center sm:max-h-[calc(100%-48px-785px-20px)] sm:min-h-[calc(48px+16px_*_2)] sm:py-4">
//           <TabsList className="mx-auto flex justify-center" variant="text">
//             <TabsTrigger value="recommend" variant="text">
//               おすすめ
//             </TabsTrigger>
//             <div className="mx-4 min-h-full w-0.5 bg-gray-300"></div>
//             <TabsTrigger value="following" variant="text">
//               フォロー中
//             </TabsTrigger>
//           </TabsList>
//         </div>
//         <div className="h-full max-h-[calc(100%-64px-64px)] flex-1 sm:max-h-full mx-auto">
//           <TabsContent
//             value="recommend"
//             variant="text"
//             className="h-full flex-col items-center"
//           >
//             <SwipeCards tabValue="recommend" post={posts[0]} fetcher={fetcher} />
//           </TabsContent>
//           {/* <TabsContent
//             value="following"
//             variant="text"
//             className="hidden h-full flex-col items-center data-[state=active]:flex"
//           >
//             <SwipeCards tabValue="following" type="followings" />
//           </TabsContent> */}
//         </div>
//       </Tabs>
//     </div>
//   );
// }