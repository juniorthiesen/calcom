import { HttpError } from "@calcom/lib/http-error";

/**
 * Checks if a user, identified by the provided userId, is a member of the team associated
 * with the event type identified by the parentId.
 *
 * @param parentId - The ID of the event type.
 * @param userId - The ID of the user.
 *
 * @throws {HttpError} If the event type is not found,
 *                     if the event type doesn't belong to any team,
 *                     or if the user isn't a member of the associated team.
 */
export default async function checkUserMembership(parentId: number, userId?: number) {
  const parentEventType = await prisma.eventType.findUnique({
    where: {
      id: parentId,
    },
    select: {
      teamId: true,
    },
  });

  if (!parentEventType) {
    throw new HttpError({
      statusCode: 404,
      message: "Event type not found.",
    });
  }

  if (!parentEventType.teamId) {
    throw new HttpError({
      statusCode: 400,
      message: "This event type is not capable of having children.",
    });
  }

  const teamMember = await prisma.membership.findFirst({
    where: {
      teamId: parentEventType.teamId,
      userId: userId,
      accepted: true,
    },
  });

  if (!teamMember) {
    throw new HttpError({
      statusCode: 400,
      message: "User is not a team member.",
    });
  }
}
