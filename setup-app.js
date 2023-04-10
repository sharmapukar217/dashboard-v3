import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const vendorData = {
	vendorName: "LogikinNepal",
	vendorAddress: "Thapathali",
	vendorEmail: "sharmapukar217@gmail.com"
};

const userData = {
	role: "developer",
	name: "Pukar Sharma",
	username: "sharmapukar217",
	password: "pukar@sharma_217",
	email: "sharmapukar217@gmail.com"
};

prisma
	.$transaction(async function (tx) {
		let vendor;
		vendor = await tx.vendor.findFirst({
			select: { id: true },
			where: { vendorName: vendorData.vendorName },
		});

		if (!vendor) {
			vendor = await tx.vendor.create({
				data: vendorData
			});
		}

		const userExists = await tx.user.count({
			where: { username: userData.username }
		});

		let user;
		if (!userExists) {
			user = await tx.user.create({
				data: {
					...userData,
					vendorId: vendor.id,
					password: await argon2.hash(userData.password),
					picture: encodeURI(
						`https://ui-avatars.com/api/?name=${userData.name}`
					)
				}
			});
		}

		return { vendor, user };
	})
	.then(console.log)
	.catch(console.error);
