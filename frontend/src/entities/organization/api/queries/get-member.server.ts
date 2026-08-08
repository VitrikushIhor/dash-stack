import 'server-only'
import { getErrorMessage } from '@/shared/api'
import serverApi from '@/shared/api/server-api-client'
import { type Membership } from '@/shared/model'

type GetMemberResponse = {
  data: Membership | null
  error: string | null
}

type Params = {
  orgId: string
  userId: string
}

export async function getMember(params: Params): Promise<GetMemberResponse> {
  const url = `/organizations/${params.orgId}/members/${params.userId}`
  try {
    const data = await serverApi.get<Membership>(url)
    return { data, error: null }
  } catch (error) {
    return { data: null, error: getErrorMessage(error) }
  }
}
