import 'dotenv/config'
import attendanceTask from './tasks/attendance'
import storagePlugin from './plugins/storage'

async function main() {
    console.log('🚀 初始化环境...')

    // 执行存储插件以配置 unstorage
    try {
        await storagePlugin()
        console.log('📦 存储系统已就绪')
    } catch (error) {
        console.error('❌ 存储系统初始化失败:', error)
    }

    console.log('📅 开始执行签到任务...')

    try {
        const result = await (attendanceTask as any).run({ payload: {}, context: {} })

        console.log(`\n✅ 任务执行完成: ${result.result}`)
        process.exit(result.result === 'success' ? 0 : 1)
    } catch (error) {
        console.error('\n❌ 任务执行过程中出错:')
        console.error(error)
        process.exit(1)
    }
}

main()
