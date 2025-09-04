// Temporary global declarations to satisfy TypeScript before SST generates types.
// Once `sst dev` or `sst deploy` runs successfully, you can remove these and add:
// /// <reference path="./.sst/platform/config.d.ts" />
declare const $config: any;
declare const $app: { stage: string; name: string };
declare function $transform(resource: any, cb: (args: any, opts?: any, name?: string) => void): void;
declare const sst: any;

export default $config({
    app() {
        return {
            name: "metamatic-api",
            home: "aws",
            providers: {
                aws: { region: "us-west-2" },
            },
        };
    },
    async run() {
        // Set default function runtime
        $transform(sst.aws.Function, (args: any) => {
            args.runtime ??= "nodejs20.x";
        });

        const { ApiStack } = await import("./infra/sst/stacks/ApiStack");
        return ApiStack();
    },
});
