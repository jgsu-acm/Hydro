$type = $args[0]

switch ($type) {
    "test" {
        yarn build:ui:production;
        docker-compose -f .\docker\docker-compose-test.yml -p hydro-test up -d --build;
    }
    "dev" {
        docker-compose -f .\docker\docker-compose-dev.yml -p hydro-dev up -d --build;
        $opt = $args[1]
        if ($opt -eq "--init") {
            npx hydrooj cli system set file.endPoint http://localhost:9000/;
            npx hydrooj cli system set file.accessKey "minioadmin";
            npx hydrooj cli system set file.secretKey "minioadmin";
            npx hydrooj cli system set hydro-elastic.host localhost;

            npx hydrooj cli user create systemadmin@systemjudge.local root rootroot 2;
            npx hydrooj cli user setSuperAdmin 2;
            npx hydrooj cli user create systemjudge@systemjudge.local judger judgerjudger 3;
            npx hydrooj cli user setJudge 3;
        }
    }
    Default {
        Write-Output "Invaild argument!"
    }
}
