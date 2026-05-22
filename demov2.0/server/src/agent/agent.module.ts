import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentService } from './agent.service';
import { WorldAgent } from './agents/world-agent';
import { StoryAgent } from './agents/story-agent';
import { NodeAgent } from './agents/node-agent';
import { LangChainProvider } from './providers/langchain.provider';
import { MockAgentProvider } from './providers/mock-agent.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    AgentService,
    WorldAgent,
    StoryAgent,
    NodeAgent,
    LangChainProvider,
    MockAgentProvider,
  ],
  exports: [AgentService],
})
export class AgentModule {}
