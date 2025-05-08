/** @format */

const cron = require("node-cron")
const axios = require("axios")
const twilio = require("twilio")

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

// Simple in-memory lock to prevent concurrent runs
let isRunning = false

module.exports = (io) => {
  // Run every minute for testing
  cron.schedule("* * * * *", async () => {
    if (isRunning) {
      console.log(
        "⏳ Maintenance notification job is already running, skipping..."
      )
      return
    }

    isRunning = true
    console.log(
      "🔧 Running daily maintenance notification check for 1-day reminders..."
    )

    try {
      // Use UTC to avoid timezone issues
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)
      console.log("Today (UTC):", today.toISOString())

      const tomorrow = new Date(today)
      tomorrow.setUTCDate(today.getUTCDate() + 1)
      tomorrow.setUTCHours(0, 0, 0, 0)
      console.log("Tomorrow (UTC):", tomorrow.toISOString())

      const dayAfterTomorrow = new Date(tomorrow)
      dayAfterTomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
      dayAfterTomorrow.setUTCHours(0, 0, 0, 0)
      console.log("Day after tomorrow (UTC):", dayAfterTomorrow.toISOString())

      console.log("Querying equipments...")
      const response = await axios.get("http://localhost:3000/equipments", {
        params: {
          nextMaintenanceDate: {
            $gte: tomorrow.toISOString(),
            $lt: dayAfterTomorrow.toISOString(),
          },
        },
      })

      const equipments = Array.isArray(response.data) ? response.data : []
      console.log("Fetched equipments:", JSON.stringify(equipments, null, 2))

      if (equipments.length === 0) {
        console.log("ℹ️ No equipment due for maintenance tomorrow.")
        return
      }

      for (const equipment of equipments) {
        console.log("Processing equipment:", equipment.name, equipment._id)

        // Log raw nextMaintenanceDate
        console.log(
          `Equipment ${equipment.name} raw nextMaintenanceDate:`,
          equipment.nextMaintenanceDate
        )

        // Normalize to UTC date-only
        const nextMaintenance = new Date(equipment.nextMaintenanceDate)
        const nextMaintenanceUTC = new Date(
          Date.UTC(
            nextMaintenance.getUTCFullYear(),
            nextMaintenance.getUTCMonth(),
            nextMaintenance.getUTCDate()
          )
        )
        console.log(
          `Equipment ${equipment.name} nextMaintenanceDate (UTC):`,
          nextMaintenanceUTC.toISOString()
        )

        if (nextMaintenanceUTC.getTime() !== tomorrow.getTime()) {
          console.log(
            `⏭️ Skipping ${
              equipment.name
            } (nextMaintenanceDate ${nextMaintenanceUTC.toISOString()} is not tomorrow)`
          )
          continue
        }

        // Check if already notified within the last 24 hours
        console.log(
          `Equipment ${equipment.name} lastNotified:`,
          equipment.lastNotified
        )
        if (equipment.lastNotified) {
          const lastNotified = new Date(equipment.lastNotified)
          const timeSinceLastNotified = today - lastNotified
          const oneDayInMs = 24 * 60 * 60 * 1000
          console.log(`Time since last notified (ms):`, timeSinceLastNotified)
          if (timeSinceLastNotified < oneDayInMs) {
            console.log(
              `⏭️ Skipping ${
                equipment.name
              } (already notified recently at ${lastNotified.toISOString()})`
            )
            continue
          }
        }

        if (equipment.status === "OUT_OF_ORDER") {
          console.log(`⏭️ Skipping ${equipment.name} (OUT_OF_ORDER)`)
          continue
        }

        const maintenanceStatus =
          today > nextMaintenance ? "Overdue" : "Due Tomorrow"
        console.log("Maintenance status:", maintenanceStatus)

        if (
          equipment.status !== "MAINTENANCE" ||
          (equipment.status === "MAINTENANCE" &&
            maintenanceStatus === "Overdue")
        ) {
          const message =
            `Reminder: ${equipment.name} (Serial: ${
              equipment.serialNumber
            }) is due for maintenance tomorrow! 📅 Date: ${nextMaintenance.toLocaleDateString()}. ` +
            `Room: ${
              equipment.room?.name || "N/A"
            }. Status: ${maintenanceStatus}.`
          console.log("Sending SMS with message:", message)

          let smsError = null
          try {
            const smsResponse = await client.messages.create({
              body: message,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: "+21625837933",
            })
            console.log("Twilio response:", smsResponse.sid)
          } catch (err) {
            console.error(
              `❌ Failed to send SMS for ${equipment.name}:`,
              err.message
            )
            smsError = err.message
            throw err // Re-throw to ensure the notification isn't logged if SMS fails
          }

          try {
            const notifyResponse = await axios.post(
              `http://localhost:3000/equipments/${equipment._id}/notify`,
              {
                type: "maintenance",
                message: message,
              }
            )
            console.log("Notify API response:", notifyResponse.data)

            console.log(
              `✅ SMS sent for: ${equipment.name} (${maintenanceStatus})`
            )

            // Emit WebSocket notification
            io.emit("maintenanceNotification", {
              equipmentId: equipment._id,
              message: message,
              sentAt: new Date(),
            })
          } catch (err) {
            console.error(
              `❌ Failed to log notification for ${equipment.name}:`,
              err.message
            )
            // Emit WebSocket event with error
            io.emit("maintenanceNotification", {
              equipmentId: equipment._id,
              message: message,
              sentAt: new Date(),
              error: smsError || `Failed to log notification: ${err.message}`,
            })
          }
        } else {
          console.log(
            `⏭️ Skipping ${equipment.name} (MAINTENANCE, not overdue)`
          )
        }
      }
    } catch (error) {
      console.error(
        "❌ Error in maintenance notification check:",
        error.message
      )
    } finally {
      isRunning = false
      console.log("🔧 Maintenance notification job completed.")
    }
  })
}
