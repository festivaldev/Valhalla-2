import { NextFunction, Request, Response } from "express";

declare module "express" {
    interface Request {
        message: String,
    }
}

const messages: string[] = [
    "It's a segment we are calling Conversation Street.",
    "It's time for us to take a gentle stroll down Conversation Street.",
    "It's time for us to check our mirrors and make a smooth left into Conversation Street.",
    "It's time for us to make a gentle left into Conversation Street.",
    "It is now time for us to engage reverse and park neatly in a marked space on Conversation Street.",
    "It's time to drop it a cog and hook a left into Conversation Street.",
    "Let's do that by popping some loose change in the ticket machine so we can park awhile on Conversation Street.",
    "It's time now for us to enjoy a gentle stroll along the sunlit sidewalks of Conversation Street.",
    "It's time now for us to take a gentle cruise down the velvety smoothness of Conversation Street.",
    "It is time to set the sat-nav for destination ‚chat‘, as we head down Conversation Street.",
    "It is now time for us to visit the headquarters of Chat & Co, who are, of course, based on Conversation Street.",
    "It's time for us to take a stroll down the smooth sidewalks of Conversation Street.",
    "It is time for us to lean on the lamppost of chat, in Conversation Street.",
    "It is now time for us to peer down a manhole of chat on Conversation Street.",
    "It's time for us to plant a sapling of chat on Conversation Street.",
    "It is time for us to pop into the post office of chat on Conversation Street.",
    "It's time to slide across an icy puddle of chat on Conversation Street.",
    "It is now time for us to plant some daffodils of opinion on the roundabout of chat at the end of Conversation Street.",
    "It is time to ring the doorbell of debate on the house of chat, located on Conversation Street.",
    "It's time to order some doughnuts of debate from the Chat Café, on Conversation Street.",
    "It’s time to step in a dog turd of chat on Conversation Street.",
    "It is time to brim the tank of chat from the petrol station of debate on the corner of Conversation Street.",
    "It is time for us to scrump an apple of chat from the orchid of intercourse which is on Conversation Street.",
    "It is time for us to splash in some puddles of chat left by the drizzle of debate that falls on Conversation Street.",
    "It’s time to say hello to the old lady of debate who sits in the bus shelter of chat on Conversation Street.",
    "It is time to buy a four-pack of chat from the off-license of debate on Conversation Street.",
];

export function TestMiddleware(req: Request, res: Response, next: NextFunction): void {
    req.message = messages[Math.random() * messages.length >> 0];
    next();
}