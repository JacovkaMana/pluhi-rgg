declare module "*.json" {
  const value: {
    zones: Array<{
      id: string;
      name: string;
      ranges: number[][];
      color: string;
      description?: string;
    }>;
  };
  export default value;
}