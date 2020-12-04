/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { run } from "../common";

type Passport = Partial<{
  byr: string; // (Birth Year)
  iyr: string; // (Issue Year)
  eyr: string; // (Expiration Year)
  hgt: string; // (Height)
  hcl: string; // (Hair Color)
  ecl: string; // (Eye Color)
  pid: string; // (Passport ID)
  cid: string; // (Country ID)
}>;

function parse(str: string): Passport[] {
  const tmp = str
    .trim()
    .split("\n")
    .reduce<[Passport[], Passport]>(
      ([done, current], line) => {
        if (line === "") {
          // console.log("push ->");
          return [[...done, current], {}];
        }
        const entries = line.split(" ").map((data) => data.split(":", 2));
        // console.log(`l |${line}|`, entries);

        return [
          done,
          {
            ...current,
            ...Object.fromEntries(entries),
          },
        ];
      },
      [[], {}]
    );

  return [...tmp[0], tmp[1]];
}

function isValidPassport(passport: Passport): boolean {
  const required: Array<keyof Passport> = [
    "byr",
    "iyr",
    "eyr",
    "hgt",
    "hcl",
    "ecl",
    "pid",
    // "cid",
  ];

  const hasAllRequired = required.every((key) => passport[key] != undefined);
  return hasAllRequired;
}

if (require.main === module) {
  console.clear();
  run({
    parse,
    exampleInput: `
ecl:gry pid:860033327 eyr:2020 hcl:#fffffd
byr:1937 iyr:2017 cid:147 hgt:183cm

iyr:2013 ecl:amb cid:350 eyr:2023 pid:028048884
hcl:#cfa07d byr:1929

hcl:#ae17e1 iyr:2013
eyr:2024
ecl:brn pid:760753108 byr:1931
hgt:179cm

hcl:#cfa07d eyr:2025 pid:166559648
iyr:2011 ecl:brn hgt:59in
    `,
    exampleOutput: 2,
    part1(input) {
      // console.log(input);
      return input.filter(isValidPassport).length;
    },
    part2Input: `
    eyr:1972 cid:100
hcl:#18171d ecl:amb hgt:170 pid:186cm iyr:2018 byr:1926

iyr:2019
hcl:#602927 eyr:1967 hgt:170cm
ecl:grn pid:012533040 byr:1946

hcl:dab227 iyr:2012
ecl:brn hgt:182cm pid:021572410 eyr:2020 byr:1992 cid:277

hgt:59cm ecl:zzz
eyr:2038 hcl:74454a iyr:2023
pid:3556412378 byr:2007

pid:087499704 hgt:74in ecl:grn iyr:2012 eyr:2030 byr:1980
hcl:#623a2f

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:165cm

hcl:#888785
hgt:164cm byr:2001 iyr:2015 cid:88
pid:545766238 ecl:hzl
eyr:2022

iyr:2010 hgt:158cm hcl:#b6652a ecl:blu byr:1944 eyr:2021 pid:093154719
    `,
    part2Output: 4,
    part2(input) {
      const validateValues = (passport: Passport) => {
        let valid: any;
        // byr (Birth Year) - four digits; at least 1920 and at most 2002.
        const byr = Number(passport.byr!);
        if (((valid = byr >= 1920 && byr <= 2002), !valid)) {
          return "byr";
        }
        // iyr (Issue Year) - four digits; at least 2010 and at most 2020.
        const iyr = Number(passport.iyr!);
        if (((valid = iyr >= 2010 && iyr <= 2020), !valid)) {
          return "iyr";
        }
        // eyr (Expiration Year) - four digits; at least 2020 and at most 2030.
        const eyr = Number(passport.eyr!);
        if (((valid = eyr >= 2020 && eyr <= 2030), !valid)) {
          return "eyr";
        }

        // hgt (Height) - a number followed by either cm or in:
        //     If cm, the number must be at least 150 and at most 193.
        //     If in, the number must be at least 59 and at most 76.
        const heightMatch = passport.hgt!.match(/(\d+)(in|cm)/);
        if (!heightMatch) {
          return "hgt";
        }
        const height = Number(heightMatch[1]);
        const unit = heightMatch[2];
        if (unit === "cm") {
          if (((valid = height >= 150 && height <= 193), !valid)) {
            return "hgt";
          }
        } else if (unit === "in") {
          if (((valid = height >= 59 && height <= 76), !valid)) {
            return "hgt";
          }
        }

        // hcl (Hair Color) - a # followed by exactly six characters 0-9 or a-f.
        if (!passport.hcl!.match(/#[0-9a-f]{6}/)) {
          // console.log(passport.hcl!.match("/[0-9a-f]{6}"));
          return "hcl";
        }
        // ecl (Eye Color) - exactly one of: amb blu brn gry grn hzl oth.

        const eyeColors = ["amb", "blu", "brn", "gry", "grn", "hzl", "oth"];
        if (!eyeColors.includes(passport.ecl!)) {
          return "ecl";
        }

        // pid (Passport ID) - a nine-digit number, including leading zeroes.
        if (!passport.pid!.match(/^\d{9}$/)) {
          return "pid";
        }
        // cid (Country ID) - ignored, missing or not.
      };

      return input.filter(isValidPassport).filter((passport) => {
        const reason = validateValues(passport);
        // if (reason) {
        //   console.log("rejected", reason, passport);
        // } else console.log("pass");
        return reason == null;
      }).length;
    },
    dir: __dirname,
  });
}

// 228
// 175
