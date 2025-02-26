import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.$transaction(async (prisma) => {
    // Create users
    const users = await prisma.user.createMany({
      data: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          avatar: 'https://example.com/avatar1.jpg',
        },
        {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          avatar: 'https://example.com/avatar2.jpg',
        },
        {
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice.smith@example.com',
          avatar: 'https://example.com/avatar3.jpg',
        },
        {
          firstName: 'Bob',
          lastName: 'Brown',
          email: 'bob.brown@example.com',
          avatar: 'https://example.com/avatar4.jpg',
        },
      ],
    });

    // Fetch users
    const user1 = await prisma.user.findFirst({ where: { email: 'john.doe@example.com' } });
    const user2 = await prisma.user.findFirst({ where: { email: 'jane.doe@example.com' } });
    const user3 = await prisma.user.findFirst({ where: { email: 'alice.smith@example.com' } });
    const user4 = await prisma.user.findFirst({ where: { email: 'bob.brown@example.com' } });

    // Create events
    const events = await prisma.event.createMany({
      data: [
        {
          name: 'Annual Conference',
          description: 'A conference for networking and knowledge sharing.',
          userId: user1?.id ?? '',
        },
        {
          name: 'Tech Meetup',
          description: 'A meetup for tech enthusiasts.',
          userId: user2?.id ?? '',
        },
        {
          name: 'Startup Pitch Night',
          description: 'An event for startups to pitch their ideas.',
          userId: user3?.id ?? '',
        },
        {
          name: 'AI Summit',
          description: 'A summit on artificial intelligence advancements.',
          userId: user4?.id ?? '',
        },
      ],
    });

    // Fetch events
    const event = await prisma.event.findFirst({ where: { name: 'Annual Conference' } });

    // Create polls
    const polls = await prisma.poll.createMany({
      data: [
        {
          question: 'What is your favorite programming language?',
          description: 'Choose from the following options.',
          userId: user1?.id ?? '',
          eventId: event?.id ?? '',
          startVoteAt: new Date(),
          endVoteAt: new Date(new Date().setDate(new Date().getDate() + 7)),
          isPublic: true,
          canEdit: true,
        },
        {
          question: 'Which tech trend excites you the most?',
          description: 'Pick the most exciting emerging technology.',
          userId: user2?.id ?? '',
          eventId: event?.id ?? '',
          startVoteAt: new Date(),
          endVoteAt: new Date(new Date().setDate(new Date().getDate() + 7)),
          isPublic: true,
          canEdit: false,
        },
      ],
    });

    // Fetch poll
    const poll = await prisma.poll.findFirst({ where: { question: 'What is your favorite programming language?' } });

    // Create poll options
    const options = await prisma.option.createMany({
      data: [
        { text: 'JavaScript', pollId: poll?.id ?? '' },
        { text: 'Python', pollId: poll?.id ?? '' },
        { text: 'Go', pollId: poll?.id ?? '' },
        { text: 'Rust', pollId: poll?.id ?? '' },
      ],
    });

    // Fetch options
    const option1 = await prisma.option.findFirst({ where: { text: 'JavaScript' } });
    const option2 = await prisma.option.findFirst({ where: { text: 'Python' } });
    const option3 = await prisma.option.findFirst({ where: { text: 'Go' } });
    const option4 = await prisma.option.findFirst({ where: { text: 'Rust' } });

    // Create votes
    await prisma.vote.createMany({
      data: [
        { pollId: poll?.id ?? '', optionId: option1?.id ?? '', userId: user1?.id ?? '' },
        { pollId: poll?.id ?? '', optionId: option2?.id ?? '', userId: user2?.id ?? '' },
        { pollId: poll?.id ?? '', optionId: option3?.id ?? '', userId: user3?.id ?? '' },
        { pollId: poll?.id ?? '', optionId: option4?.id ?? '', userId: user4?.id ?? '' },
      ],
    });
  });

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
