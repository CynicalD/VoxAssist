import type { IGenerator, IRetriever, IVectorStore } from "../contract/types";
import { Generator } from "./generation";
import { MockGenerator, MockRetriever, MockVectorStore } from "./mocks";
import { Retriever } from "./retrieval";
import { VectorStore } from "./store";

function useMockAi(): boolean {
  return process.env.USE_MOCK_AI !== "false";
}

export function getStore(): IVectorStore {
  return useMockAi() ? new MockVectorStore() : new VectorStore();
}

export function getRetriever(): IRetriever {
  return useMockAi() ? new MockRetriever() : new Retriever();
}

export function getGenerator(): IGenerator {
  return useMockAi() ? new MockGenerator() : new Generator();
}
