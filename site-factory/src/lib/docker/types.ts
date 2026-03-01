// src/lib/docker/types.ts
export interface ServiceInfo {
  service: string;
  label: string;
  state: string;
  status: string;
  ports: string[];
  description: string;
  expected: boolean;
}